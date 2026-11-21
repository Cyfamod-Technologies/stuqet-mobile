import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { useShopInfo } from "~/features/seller-shop/hooks";
import { useThemeColors } from "~/lib/colors";
import { notifySuccess } from "~/lib/utils/toast";
import { FormScreen } from "../components/form-screen";
import { StatusPanel } from "../components/status-panel";
import { VerificationFields } from "../components/verification-fields";
import { useSubmitVerification, useVerificationForm } from "../hooks";
import { createVerificationSchema, emptyVerificationValues } from "../schemas";
import type { VerificationElement, VerificationFormValues } from "../types";

interface VerificationFormProps {
  elements: VerificationElement[];
}

function VerificationForm({ elements }: VerificationFormProps) {
  const router = useRouter();
  const submit = useSubmitVerification();

  const schema = useMemo(() => createVerificationSchema(elements), [elements]);
  const { control, handleSubmit, reset } = useForm<VerificationFormValues>({
    resolver: zodResolver(schema) as Resolver<VerificationFormValues>,
    defaultValues: emptyVerificationValues(elements),
  });

  const fill =
    process.env.EXPO_PUBLIC_DEMO_MODE === "true"
      ? () => {
          const samples =
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require("~/demo/samples") as typeof import("~/demo/samples");
          reset(samples.verificationSample(elements));
        }
      : undefined;

  const onSubmit = handleSubmit((values) => {
    submit.mutate(
      { elements, values },
      {
        onSuccess: (message) => {
          notifySuccess({ message });
          router.back();
        },
      },
    );
  });

  return (
    <FormScreen
      title="Verification"
      demoFill={fill}
      footer={
        <Button onPress={onSubmit} loading={submit.isPending}>
          Submit for review
        </Button>
      }
    >
      <StatusPanel
        icon="shield-checkmark-outline"
        title="Your shop is not verified"
      >
        Verified shops get a badge on their storefront. Documents are reviewed
        before approval.
      </StatusPanel>
      <VerificationFields elements={elements} control={control} />
    </FormScreen>
  );
}

export function VerificationScreen() {
  const colors = useThemeColors();
  const shop = useShopInfo();
  const verified = shop.data?.verified === true;
  const submitted = shop.data?.is_submitted_form === true;
  const needsForm = shop.isSuccess && !verified && !submitted;
  const form = useVerificationForm(needsForm);

  const refresh = (
    <RefreshControl
      refreshing={shop.isRefetching}
      onRefresh={() => {
        shop.refetch();
        if (needsForm) form.refetch();
      }}
      tintColor={colors.primary}
    />
  );

  if (shop.isPending) {
    return (
      <FormScreen title="Verification">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-[76px] rounded-2xl" />
        <Skeleton className="h-[76px] rounded-2xl" />
      </FormScreen>
    );
  }

  if (shop.isError) {
    return (
      <FormScreen title="Verification">
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load your shop"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => shop.refetch()}
        />
      </FormScreen>
    );
  }

  if (verified) {
    return (
      <FormScreen title="Verification" refreshControl={refresh}>
        <StatusPanel
          tone="success"
          icon="shield-checkmark"
          title="Your shop is verified"
        >
          Your storefront shows the verified badge.
        </StatusPanel>
      </FormScreen>
    );
  }

  if (submitted) {
    return (
      <FormScreen title="Verification" refreshControl={refresh}>
        <StatusPanel icon="time-outline" title="Under review">
          We received your documents. You will see the verified badge here once
          they are approved.
        </StatusPanel>
      </FormScreen>
    );
  }

  if (form.isPending) {
    return (
      <FormScreen title="Verification">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-[52px] rounded-2xl" />
        <Skeleton className="h-[76px] rounded-2xl" />
        <Skeleton className="h-[76px] rounded-2xl" />
      </FormScreen>
    );
  }

  if (form.isError) {
    return (
      <FormScreen title="Verification">
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load the verification form"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => form.refetch()}
        />
      </FormScreen>
    );
  }

  if (form.data.length === 0) {
    return (
      <FormScreen title="Verification">
        <EmptyState
          icon="shield-checkmark-outline"
          title="Nothing to submit yet"
          message="There are no verification details to fill in right now."
        />
      </FormScreen>
    );
  }

  return <VerificationForm elements={form.data} />;
}
