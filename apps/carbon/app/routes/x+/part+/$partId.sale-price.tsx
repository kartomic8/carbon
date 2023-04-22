import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { validationError } from "remix-validated-form";
import { useRouteData } from "~/hooks";
import type { UnitOfMeasureListItem } from "~/modules/parts";
import {
  partUnitSalePriceValidator,
  upsertPartUnitSalePrice,
} from "~/modules/parts";
import { PartSalePriceForm, getPartUnitSalePrice } from "~/modules/parts";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { assertIsPost } from "~/utils/http";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderArgs) {
  const { client } = await requirePermissions(request, {
    view: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const [partUnitSalePrice] = await Promise.all([
    getPartUnitSalePrice(client, partId),
  ]);

  if (partUnitSalePrice.error) {
    return redirect(
      "/x/parts",
      await flash(
        request,
        error(partUnitSalePrice.error, "Failed to load part unit sale price")
      )
    );
  }

  return json({
    partUnitSalePrice: partUnitSalePrice.data,
  });
}

export async function action({ request, params }: ActionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  // validate with partsValidator
  const validation = await partUnitSalePriceValidator.validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const updatePartUnitSalePrice = await upsertPartUnitSalePrice(client, {
    ...validation.data,
    partId,
    updatedBy: userId,
  });
  if (updatePartUnitSalePrice.error) {
    return redirect(
      `/x/part/${partId}`,
      await flash(
        request,
        error(updatePartUnitSalePrice.error, "Failed to update part sale price")
      )
    );
  }

  return redirect(
    `/x/part/${partId}/sale-price`,
    await flash(request, success("Updated part sale price"))
  );
}

export default function PartSalePriceRoute() {
  const sharedPartData = useRouteData<{
    unitOfMeasures: UnitOfMeasureListItem[];
  }>("/x/part");

  const { partUnitSalePrice } = useLoaderData<typeof loader>();

  const initialValues = {
    ...partUnitSalePrice,
    salesUnitOfMeasureCode: partUnitSalePrice?.salesUnitOfMeasureCode ?? "",
  };

  return (
    <PartSalePriceForm
      initialValues={initialValues}
      unitOfMeasures={sharedPartData?.unitOfMeasures ?? []}
    />
  );
}