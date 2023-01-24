import { useColor } from "@carbon/react";
import { Button, HStack } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { IoMdAdd } from "react-icons/io";
import { DebouncedInput } from "~/components/Search";
import { usePermissions, useUrlParams } from "~/hooks";

const GroupsTableFilters = () => {
  const [params] = useUrlParams();
  const permissions = usePermissions();
  const borderColor = useColor("gray.200");
  return (
    <HStack
      borderBottomColor={borderColor}
      borderBottomStyle="solid"
      borderBottomWidth={1}
      justifyContent="space-between"
      px={4}
      py={3}
      w="full"
    >
      <HStack spacing={2}>
        <DebouncedInput
          param="name"
          size="sm"
          minW={180}
          placeholder="Search by name"
        />
      </HStack>
      <HStack spacing={2}>
        {permissions.can("create", "users") && (
          <Button
            as={Link}
            to={`new?${params.toString()}`}
            colorScheme="brand"
            leftIcon={<IoMdAdd />}
          >
            New Group
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

export default GroupsTableFilters;