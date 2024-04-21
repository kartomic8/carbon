//import { createRemixRoute } from "@trigger.dev/remix";
import { triggerClient } from "~/lib/trigger.server";
import serverRuntime from "@remix-run/server-runtime";
import type { ActionFunction } from "@remix-run/node";

// Remix will automatically strip files with side effects
// So you need to *export* your Job definitions like this:
//export * from "~/jobs.server";

// export const { action } = createRemixRoute(triggerClient);

export const action: ActionFunction = async ({ request }) => {
  const response = await triggerClient.handleRequest(request);
  if (!response) {
    return serverRuntime.json(
      {
        error: "Not found",
      },
      {
        status: 404,
      }
    );
  }
  return serverRuntime.json(response.body, {
    status: response.status,
    headers: response.headers,
  });
};
