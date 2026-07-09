"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loader from "@/components/Loader";
import { cn } from "@/lib/utils";
import { addAddress, updateAddress } from "@/lib/actions/address.actions";
import AddressDialog from "@/lib/forms/addressForm";
import { z } from "zod";
import { Address as AddressSchema } from "@/lib/validations";

import BreadcrumbHeader from "@/components/BreadcrumbHeader";
import OrderConfirmationDialog from "@/components/OrderConfirmationDialog";
import DiscountSection from "@/components/Discount";
import AccordionSection from "@/components/AccordionSection";
import { useCheckout } from "@/hooks/useCheckout";
import { RewardRedemptionComponent } from "@/components/RewardPointsSection";
import GuestCheckoutForm from "@/components/GuestCheckoutForm";
import { toast } from "sonner";
import FreeDeliveryIndicator from "@/components/FreeDeliveryIndicator";

type DeliveryAddress = z.infer<typeof AddressSchema> & {
  _id?: string;
};

const CheckoutPage = () => {
  const { data: session } = useSession();
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const {
    state,
    dispatch,
    updateQuantity,
    removeItem,
    handleApplyDiscount,
    confirmOrder,
    getReferralDiscountDetails,
    handleRedeemRewardPoints,
  } = useCheckout();

  const { referralDiscount, referralDiscountType, referralCode } =
    getReferralDiscountDetails();

  useEffect(() => {
    if (session) {
      setShowGuestForm(false);
    }
  }, [session]);

  // ─────────────────────────────────────────────────────────────────
  // Pincode validation including state & district (district optional)
  // ─────────────────────────────────────────────────────────────────
  const validatePincodeWithStateAndDistrict = async (
    pincode: string,
    userState: string,
    userDistrict?: string   // optional – if not provided, skip district check
  ): Promise<boolean> => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      toast.error("Invalid pincode", { description: "Please enter a valid 6-digit pincode." });
      return false;
    }

    try {
      const res = await fetch(`/api/validate-pincode?pincode=${pincode}`);
      const data = await res.json();

      if (!data.success) {
        toast.error("Invalid pincode", { description: data.error || "Pincode not found." });
        return false;
      }

      // State check (required)
      if (userState && userState.toLowerCase() !== data.state.toLowerCase()) {
        toast.error("State mismatch", {
          description: `This pincode belongs to "${data.state}", not "${userState}". Please correct the state.`,
        });
        return false;
      }

      // District check (only if userDistrict is provided)
      if (userDistrict && userDistrict.toLowerCase() !== data.district.toLowerCase()) {
        toast.error("District mismatch", {
          description: `This pincode belongs to "${data.district}" district, not "${userDistrict}". Please correct the district.`,
        });
        return false;
      }

      return true;
    } catch (err) {
      console.warn("Frontend pincode validation failed, relying on backend", err);
      return true;
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Add new address
  // ─────────────────────────────────────────────────────────────────
  const handleAddressSubmit = async (formData: DeliveryAddress) => {
    try {
      const pincode = String(formData.pincode).trim();
      if (!formData.address_line_1?.trim()) {
        toast.error("Missing address", { description: "Please enter your Address (Area & Street)." });
        return;
      }

      // Validate pincode, state, and optional district
      const isValid = await validatePincodeWithStateAndDistrict(
        pincode,
        formData.state,
        formData.district   // uses district field from form – make sure your AddressDialog includes it
      );
      if (!isValid) return;

      const addResponse = await addAddress(formData);
      if (addResponse.success) {
        const newAddress = addResponse.addresses[addResponse.addresses.length - 1];
        dispatch({
          type: "SET_USER_DATA",
          payload: { ...state.userData!, addresses: addResponse.addresses },
        });
        dispatch({ type: "SET_SELECTED_ADDRESS", payload: newAddress._id });
        toast.success("Address added successfully");
        setShowAddressDialog(false);
      } else {
        toast.error(addResponse.message || "Failed to add address");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while saving the address");
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Update existing address
  // ─────────────────────────────────────────────────────────────────
  const handleAddressUpdate = async (formData: DeliveryAddress) => {
    if (!editingAddress?._id) {
      toast.error("No address selected for editing");
      return;
    }

    try {
      const pincode = String(formData.pincode).trim();
      if (!formData.address_line_1?.trim()) {
        toast.error("Missing address", {
          description: "Please enter your Address (Area & Street).",
        });
        return;
      }

      const isValid = await validatePincodeWithStateAndDistrict(
        pincode,
        formData.state,
        formData.district
      );
      if (!isValid) return;

      const updateResponse = await updateAddress(editingAddress._id.toString(), formData);

      if (updateResponse.success) {
        dispatch({
          type: "SET_USER_DATA",
          payload: {
            ...state.userData!,
            addresses: updateResponse.addresses,
          },
        });
        toast.success("Address updated successfully");
        setShowAddressDialog(false);
        setEditingAddress(null);
        setIsEditingAddress(false);
      } else {
        toast.error(updateResponse.message || "Failed to update address");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating the address");
    }
  };

  if (state.loading) return <Loader />;
  if (!state.checkoutData) return null;

  const setPointsToRedeem = (points: number) => {
    dispatch({ type: "SET_POINTS_TO_REDEEM", payload: points });
  };

  const handleGuestCheckoutSuccess = (userData: { id: string; email: string; name: string }) => {
    dispatch({
      type: "SET_USER_DATA",
      payload: {
        _id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: "",
        password: "",
        addresses: [],
        role: "user" as const,
        isVerified: true,
        __v: 0,
        cart: [],
        wishlist: [],
        order: [],
      },
    });
    setShowGuestForm(false);
    try {
      sessionStorage.removeItem("checkoutData");
      dispatch({ type: "SET_CHECKOUT_DATA", payload: null });
      dispatch({ type: "SET_SELECTED_ADDRESS", payload: "" });
    } catch (e) {
      // ignore
    }
  };

  // Guest checkout flows
  if (!session && !showGuestForm) {
    return (
      <div className="bg-gray-50">
        <BreadcrumbHeader title="Home" subtitle="Checkout" titleHref="/" />
        <div className="dynamic-container min-h-screen mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Checkout Options</h2>
            <div className="space-y-4">
              <Button className="w-full primary-btn" onClick={() => (window.location.href = "/sign-in")}>
                Sign In to Checkout
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowGuestForm(true)}>
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session && showGuestForm) {
    return (
      <div className="bg-gray-50">
        <BreadcrumbHeader title="Home" subtitle="Checkout" titleHref="/" />
        <div className="dynamic-container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Guest Checkout</h2>
            <GuestCheckoutForm onSuccess={handleGuestCheckoutSuccess} />
          </div>
        </div>
      </div>
    );
  }

  // Main checkout UI
  return (
    <div className="bg-gray-50">
      <BreadcrumbHeader title="Home" subtitle="Checkout" titleHref="/" />

      <div className="dynamic-container mx-auto px-4 py-8 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery To */}
            <AccordionSection id="deliveryTo" title="DELIVERY TO" index={1} expandedSection="deliveryTo">
              <p className="font-medium">{state.userData?.name}</p>
              <p className="text-gray-600">{state.userData?.phone}</p>
            </AccordionSection>

            {/* Delivery Address */}
            <AccordionSection id="deliveryAddress" title="DELIVERY ADDRESS" index={2} expandedSection="deliveryAddress">
              {state.userData?.addresses && state.userData.addresses.length > 0 ? (
                <div className="space-y-3">
                  {state.userData.addresses.map((address) => (
                    <div
                      key={address._id}
                      className={cn(
                        "border rounded-md p-4 flex justify-between",
                        state.selectedAddress === address._id ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    >
                      <div>
                        <p className="font-semibold">{address.name}</p>
                        <p className="text-sm text-gray-600">{address.contact}</p>
                        <p className="text-sm text-gray-600">{address.address_line_1}</p>
                        {address.address_line_2 && <p className="text-sm text-gray-600">{address.address_line_2}</p>}
                        <p className="text-sm text-gray-600">
                          {address.locality}, {address.state} - {address.pincode}
                        </p>
                        <div className="gap-2 mt-2">
                          <span className="inline-block text-xs px-2 py-1 bg-gray-100 rounded mb-2">{address.type}</span>
                          <button
                            className=" flex inline-block text-xs px-3 py-2 bg-red-600 text-white rounded mt-2"
                            onClick={() => {
                              setEditingAddress(address);
                              setIsEditingAddress(true);
                              setShowAddressDialog(true);
                            }}
                          >
                            Edit Address
                          </button>
                        </div>
                      </div>
                      <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => dispatch({ type: "SET_SELECTED_ADDRESS", payload: address._id! })}
                      >
                        DELIVER HERE
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>No addresses found. Please add a delivery address.</p>
                  <Button className="mt-4 primary-btn" onClick={() => setShowAddressDialog(true)}>
                    Add New Address
                  </Button>
                </div>
              )}
            </AccordionSection>

            {/* Address Dialog */}
            <AddressDialog
              open={showAddressDialog}
              onOpenChange={(open) => {
                setShowAddressDialog(open);
                if (!open) {
                  setEditingAddress(null);
                  setIsEditingAddress(false);
                }
              }}
              isEditing={isEditingAddress}
              editingAddress={editingAddress}
              onSubmit={isEditingAddress ? handleAddressUpdate : handleAddressSubmit}
            />

            {/* Order Summary */}
            <AccordionSection
              id="orderSummary"
              title="ORDER SUMMARY"
              index={3}
              expandedSection="orderSummary"
              showItemCount={state.checkoutData.items.length}
            >
              {state.checkoutData.items.map((item) => (
                <div key={item.productId} className="flex gap-4 border-b pb-4">
                  <Image
                    src={`/api/files/${item.coverImage}`}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productName}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.selectedSize && (
                        <p>
                          Size:{" "}
                          {typeof item.selectedSize === "string" ? item.selectedSize : item.selectedSize.label}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            className="h-6 w-6 border rounded-full flex items-center justify-center"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            className="h-6 w-6 border rounded-full flex items-center justify-center"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button className="text-red-600 text-sm" onClick={() => removeItem(item.productId)}>
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    {item.selectedSize &&
                      typeof item.selectedSize === "object" &&
                      item.selectedSize.mrp > item.selectedSize.netPrice && (
                        <p className="text-xs text-gray-500 line-through">
                          ₹{(item.selectedSize.mrp * item.quantity).toLocaleString("en-IN")}
                        </p>
                      )}
                    <p className="text-sm text-gray-600">Delivery: {item.deliveryDate}</p>
                  </div>
                </div>
              ))}
            </AccordionSection>

            {/* Payment Options */}
            <AccordionSection id="paymentOptions" title="PAYMENT OPTIONS" index={4} expandedSection="paymentOptions">
              <RadioGroup
                value={state.paymentOption}
                onValueChange={(value) => dispatch({ type: "SET_PAYMENT_OPTION", payload: value })}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-2 border rounded-md">
                  <RadioGroupItem value="razorpay" id="razorpay" className="text-red-600 border-red-600" />
                  <Label htmlFor="razorpay" className="flex items-center gap-2">
                    <span>Online Payment</span>
                    <span className="text-xs text-gray-500">(Cards, UPI, Wallets, NetBanking)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded-md">
                  <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" className="text-red-600 border-red-600" />
                  <Label htmlFor="cash-on-delivery">Cash on Delivery (COD)</Label>
                </div>
              </RadioGroup>
            </AccordionSection>

            {/* Discount & Rewards */}
            <AccordionSection id="discount" title="DISCOUNT & REWARDS" index={5} expandedSection="discount">
              <DiscountSection
                onApplyDiscount={handleApplyDiscount}
                discountCode={state.discountCode}
                setDiscountCode={(code) => dispatch({ type: "SET_DISCOUNT_CODE", payload: code })}
                discountAmount={state.discountAmount}
                discountInfo={state.discountInfo}
                loadingDiscount={state.loadingDiscount}
              />
              <RewardRedemptionComponent
                userData={state.userData}
                pointsToRedeem={state.pointsToRedeem}
                setPointsToRedeem={setPointsToRedeem}
                handleRedeemRewardPoints={handleRedeemRewardPoints}
                rewardDiscountAmount={state.rewardDiscountAmount}
                loadingRewardRedemption={state.loadingRewardRedemption}
              />
            </AccordionSection>
          </div>

          {/* Right Column - Price Details */}
          <div className="lg:col-span-1 space-y-4">
            <FreeDeliveryIndicator
              subtotal={state.checkoutData.subtotal}
              originalDeliveryCharges={
                state.checkoutData?.items.reduce(
                  (sum) => sum + (state.checkoutData?.deliveryCharges || 0) / (state.checkoutData?.items.length || 1),
                  0
                ) || 0
              }
            />

            <div className="bg-white p-6 rounded-md shadow-sm sticky top-4">
              <h2 className="text-xl font-bold mb-4">PRICE DETAILS</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Price ({state.checkoutData.items.length} items)</span>
                  <span>₹{state.checkoutData.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  {state.checkoutData.deliveryCharges > 0 ? (
                    <span>₹{state.checkoutData.deliveryCharges.toLocaleString("en-IN")}</span>
                  ) : (
                    <span className="text-green-500">Free</span>
                  )}
                </div>

                {state.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{state.discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {referralDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Referral Discount{referralCode && ` (${referralCode})`}</span>
                    <span>- ₹{referralDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {state.rewardDiscountAmount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Reward Points ({state.pointsToRedeem} points)</span>
                    <span>- ₹{state.rewardDiscountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{state.checkoutData.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={confirmOrder}
                disabled={state.loading || !state.selectedAddress || state.submitting}
              >
                {state.submitting ? "Processing..." : "Confirm order"}
              </Button>
            </div>
          </div>
        </div>
      </div>

     <OrderConfirmationDialog
        isOpen={state.isConfirmationOpen}
        onClose={() =>
          dispatch({ type: "SET_CONFIRMATION_OPEN", payload: false })
        }
        orderId={state.confirmedOrderId}
      />
    </div>
  );
};
export default CheckoutPage;