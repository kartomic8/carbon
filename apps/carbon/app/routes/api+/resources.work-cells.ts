import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getWorkCellList } from "~/modules/resources";
import { requirePermissions } from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorized = await requirePermissions(request, {
    view: "resources",
  });

  const url = new URL(request.url);
  const location = url.searchParams.get("location");
  const workCellType = url.searchParams.get("workCellType");

  return json(await getWorkCellList(authorized.client, location, workCellType));
}
