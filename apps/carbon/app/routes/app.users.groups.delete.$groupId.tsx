import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { DeleteGroupModal } from "~/modules/Users/Groups";
import { requirePermissions } from "~/services/auth";
import { deleteGroup, getGroup } from "~/services/users";
import { flash } from "~/services/session";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderArgs) {
  const { client } = await requirePermissions(request, {
    view: "users",
  });
  const { groupId } = params;

  const group = await getGroup(client, groupId!);
  if (group.error) {
    return redirect(
      "/app/users/groups",
      await flash(request, error(group.error, "Failed to get group"))
    );
  }

  return json(group);
}

export async function action({ request, params }: ActionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "users",
  });

  const { groupId } = params;
  if (!groupId) {
    return redirect(
      "/app/users/groups",
      await flash(request, error(params, "Failed to get an group id"))
    );
  }

  const { error: deleteGroupError } = await deleteGroup(client, groupId);
  if (deleteGroupError) {
    return redirect(
      "/app/users/groups",
      await flash(request, error(deleteGroupError, "Failed to delete group"))
    );
  }

  return redirect(
    "/app/users/groups",
    await flash(request, success("Successfully deleted group"))
  );
}

export default function DeleteEmployeeTypeRoute() {
  const { groupId } = useParams();
  const { data } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!groupId || !data) return null; // TODO - handle this better (404?)

  const onCancel = () => navigate("/app/users/groups");

  return <DeleteGroupModal groupId={groupId} data={data} onCancel={onCancel} />;
}