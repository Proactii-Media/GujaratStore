import { Minus, Plus } from "lucide-react";
import { Button } from "./button";

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  max?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  setQuantity,
  max,
}) => {
return (
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="icon"
      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
      disabled={quantity <= 1}
      className="bg-red-200 hover:bg-brand text-brand hover:text-white border-brand font-semibold"
    >
      <Minus className="h-4 w-4 "  />
    </Button>

    <span className="w-8 text-center">{quantity}</span>

    <Button
      variant="outline"
      size="icon"
      onClick={() =>
        quantity < (max ?? Infinity) && setQuantity(quantity + 1)
      }
      disabled={quantity >= (max ?? Infinity)}
      className="bg-red-200 hover:bg-brand text-brand hover:text-white border-brand font-semibold"
    >
      <Plus className="h-4 w-4 "  />
    </Button>
  </div>
);
};

export default QuantitySelector;
