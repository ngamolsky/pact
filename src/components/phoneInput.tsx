import { ErrorMessage, Field, useFormikContext } from "formik";
import React, { useState, useEffect } from "react";

const validatePhoneNumber = (value: string) => {
  let error;
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

export const PhoneInput: React.FC<{
  onValidPhoneNumber?: (phone: string) => void;
}> = ({ onValidPhoneNumber }) => {
  const [inputValue, setInputValue] = useState("");
  const { setFieldValue } = useFormikContext();

  // Custom debounce function
  const debounce = (func: () => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func();
      }, delay);
    };
  };

  useEffect(() => {
    const debouncedCheck = debounce(() => {
      const isValid = validatePhoneNumber(inputValue);
      if (!isValid && onValidPhoneNumber) {
        onValidPhoneNumber(inputValue);
      }
    }, 500); // Adjust debounce time as needed

    debouncedCheck();

    // Cleanup function to clear the timeout
    return () => {};
  }, [inputValue, onValidPhoneNumber]);

  return (
    <div className="flex flex-col flex-grow relative mb-2">
      <Field
        type="tel"
        name="phoneNumber"
        placeholder="+1234567890"
        className="w-full p-2 border border-gray-300 rounded-lg outline-gradientEnd mb-6"
        validate={validatePhoneNumber}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(e.target.value);
          setFieldValue("phoneNumber", e.target.value); // Update formik field value
        }}
      />
      <ErrorMessage
        name="phoneNumber"
        component="div"
        className="absolute left-0 bottom-0 text-xs text-red-500 whitespace-nowrap overflow-x-auto max-w-full"
      />
    </div>
  );
};
