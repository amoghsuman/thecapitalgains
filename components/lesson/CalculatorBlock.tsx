"use client";

import SipCalculator from "./SipCalculator";
import CapitalGainsTaxCalculator from "./CapitalGainsTaxCalculator";
import EmiCalculator from "./EmiCalculator";

export type CalculatorBlockValue = { calculatorType?: "sip" | "capitalGainsTax" | "emi" };

export default function CalculatorBlock({ value }: { value: CalculatorBlockValue }) {
  switch (value.calculatorType) {
    case "capitalGainsTax":
      return <CapitalGainsTaxCalculator />;
    case "emi":
      return <EmiCalculator />;
    case "sip":
    default:
      return <SipCalculator />;
  }
}
