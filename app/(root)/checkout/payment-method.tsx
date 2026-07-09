"use client";

import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const PaymentMethod = () => {
  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Оплата</h1>
      </div>
    </>
  );
};

export default PaymentMethod;
