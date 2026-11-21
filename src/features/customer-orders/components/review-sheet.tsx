import { useState } from "react";
import { View } from "react-native";
import { DemoFill } from "~/components/demo-fill";
import { ShopLogo } from "~/components/shop-logo";
import { BottomSheet } from "~/components/ui/bottom-sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { StarRating } from "~/components/ui/star-rating";
import { Text } from "~/components/ui/text";
import { useSubmitReview } from "../hooks";
import type { OrderSummary } from "../types";

interface ReviewSheetProps {
  order: OrderSummary | null;
  onClose: () => void;
}

// "Rate your order" sheet: the vendor logo, the order, five tappable stars
// (filled = chosen, outlined = not), an optional comment and Submit review.
export function ReviewSheet({ order, onClose }: ReviewSheetProps) {
  return (
    <BottomSheet
      visible={order !== null}
      onClose={onClose}
      title="Rate your order"
      subtitle={order ? `${order.vendor.name} · #${order.code}` : undefined}
    >
      {order ? (
        <ReviewForm key={order.id} order={order} onDone={onClose} />
      ) : null}
    </BottomSheet>
  );
}

function ReviewForm({
  order,
  onDone,
}: {
  order: OrderSummary;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sample, setSample] = useState(0);
  const submit = useSubmitReview();

  const fill = () => {
    const { customerSamples } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("~/demo/customer") as typeof import("~/demo/customer");
    setRating(4);
    setComment(customerSamples.review[sample % customerSamples.review.length]);
    setSample((n) => n + 1);
  };

  return (
    <View className="gap-3.5">
      <View className="flex-row items-center gap-3">
        <ShopLogo uri={order.vendor.logo} name={order.vendor.name} size={40} />
        <View className="flex-1 items-center">
          <StarRating value={rating} onChange={setRating} size={34} gap={4} />
        </View>
      </View>
      <DemoFill
        onFill={process.env.EXPO_PUBLIC_DEMO_MODE === "true" ? fill : undefined}
      />
      <View className="gap-1.5">
        <Text className="font-sans-semibold text-sm">Comment (optional)</Text>
        <Input
          value={comment}
          onChangeText={setComment}
          placeholder="Tell others what you thought"
          multiline
          numberOfLines={3}
          style={{ minHeight: 72 }}
        />
      </View>
      <Button
        disabled={rating < 1}
        loading={submit.isPending}
        onPress={() =>
          submit.mutate(
            { orderId: order.id, rating, comment: comment.trim() },
            { onSuccess: onDone },
          )
        }
      >
        Submit review
      </Button>
    </View>
  );
}
