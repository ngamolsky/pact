import { forwardRef } from "react";
import { ErrorMessage, Field } from "formik";
import { NumberFormatValues, PatternFormat } from "react-number-format";

interface PhoneInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  shouldValidate: boolean;
}

const validatePhoneNumber = (value: string | undefined) => {
  let error: string | undefined;
  if (!value) {
    error = "Phone number is required";
  } else if (
    !/^(?:\+\d{1,2}\s?)?1?-?\.?\s?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/.test(
      value
    )
  ) {
    error = "Phone number is not valid";
  }
  return error;
};

export const PhoneInput = forwardRef<
  HTMLInputElement,
  PhoneInputProps & JSX.IntrinsicElements["input"]
>(({ value: externalValue, onChange, shouldValidate }, ref) => {
  return (
    <div className="flex flex-col flex-grow relative">
      <Field
        name="phoneNumber"
        validate={shouldValidate && validatePhoneNumber}
        as={PatternFormat}
        customInput="input"
        format="(###) ###-####"
        placeholder="(___) ___-____"
        mask="_"
        isAllowed={(values: NumberFormatValues) => {
          const { floatValue } = values;
          return !floatValue || !isNaN(floatValue);
        }}
        type="tel"
        className={`w-full p-2 border border-gray-300 rounded-lg outline-gradientEnd ${shouldValidate && "mb-6"}`}
        onValueChange={(val: NumberFormatValues) => {
          if (onChange) {
            onChange({
              target: {
                name: "phoneNumber",
                value: val.value,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
        getInputRef={ref}
        value={externalValue} // Handling controlled scenario
      />
      {shouldValidate && (
        <ErrorMessage
          name="phoneNumber"
          component="div"
          className="absolute left-0 bottom-0 text-xs text-red-500 whitespace-nowrap overflow-x-auto max-w-full"
        />
      )}
    </div>
  );
});
