import {
  Button,
  Enumerable,
  HStack,
  MenuIcon,
  MenuItem,
  useDisclosure,
} from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo, useState } from "react";
import { BiAddToQueue } from "react-icons/bi";
import { BsFillCheckCircleFill, BsFillPenFill, BsListUl } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { New, Table } from "~/components";
import { ConfirmDelete } from "~/components/Modals";
import { usePermissions, useUrlParams } from "~/hooks";
import type { EquipmentType } from "~/modules/resources";
import { path } from "~/utils/path";

type EquipmentTypesTableProps = {
  data: EquipmentType[];
  count: number;
};

const EquipmentTypesTable = memo(
  ({ data, count }: EquipmentTypesTableProps) => {
    const navigate = useNavigate();
    const [params] = useUrlParams();
    const permissions = usePermissions();
    const deleteModal = useDisclosure();
    const [selectedType, setSelectedType] = useState<
      EquipmentType | undefined
    >();

    const onDelete = (data: EquipmentType) => {
      setSelectedType(data);
      deleteModal.onOpen();
    };

    const onDeleteCancel = () => {
      setSelectedType(undefined);
      deleteModal.onClose();
    };

    const columns = useMemo<ColumnDef<EquipmentType>[]>(() => {
      return [
        {
          accessorKey: "name",
          header: "Equipment Type",
          cell: ({ row }) => (
            <HStack>
              <Enumerable
                value={row.original.name}
                onClick={() => navigate(row.original.id)}
                className="cursor-pointer"
              />
              {row.original.requiredAbility && (
                <BsFillCheckCircleFill
                  className="text-green-500"
                  title="Requires ability"
                />
              )}
            </HStack>
          ),
        },
        {
          accessorKey: "description",
          header: "Description",
          cell: ({ row }) => (
            <span className="max-w-[300px] line-clamp-1">
              {row.original.description}
            </span>
          ),
        },
        {
          header: "Equipment",
          cell: ({ row }) => (
            <Button
              variant="secondary"
              onClick={() => {
                navigate(
                  `${path.to.equipmentTypeList(
                    row.original.id
                  )}?${params?.toString()}`
                );
              }}
            >
              {Array.isArray(row.original.equipment)
                ? row.original.equipment?.length ?? 0
                : 0}{" "}
              Units
            </Button>
          ),
        },
      ];
    }, [navigate, params]);

    const renderContextMenu = useCallback<(row: EquipmentType) => JSX.Element>(
      (row) => (
        <>
          <MenuItem
            onClick={() => {
              navigate(`${path.to.newEquipment(row.id)}?${params?.toString()}`);
            }}
          >
            <MenuIcon icon={<BiAddToQueue />} />
            New Unit
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate(
                `${path.to.equipmentTypeList(row.id)}?${params?.toString()}`
              );
            }}
          >
            <MenuIcon icon={<BsListUl />} />
            View Equipment
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate(path.to.equipmentType(row.id));
            }}
          >
            <MenuIcon icon={<BsFillPenFill />} />
            Edit Equipment Type
          </MenuItem>
          <MenuItem
            disabled={!permissions.can("delete", "users")}
            onClick={() => onDelete(row)}
          >
            <MenuIcon icon={<IoMdTrash />} />
            Delete Equipment Type
          </MenuItem>
        </>
      ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [navigate, params, permissions]
    );

    return (
      <>
        <Table<EquipmentType>
          data={data}
          columns={columns}
          count={count ?? 0}
          primaryAction={
            permissions.can("update", "resources") && (
              <New label="Equipment Type" to={`new?${params.toString()}`} />
            )
          }
          renderContextMenu={renderContextMenu}
        />
        {selectedType && selectedType.id && (
          <ConfirmDelete
            action={path.to.deleteEquipmentType(selectedType.id)}
            name={selectedType?.name ?? ""}
            text={`Are you sure you want to deactivate the ${selectedType?.name} equipment type?`}
            isOpen={deleteModal.isOpen}
            onCancel={onDeleteCancel}
            onSubmit={onDeleteCancel}
          />
        )}
      </>
    );
  }
);

EquipmentTypesTable.displayName = "EquipmentTypesTable";
export default EquipmentTypesTable;
