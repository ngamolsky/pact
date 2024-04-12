import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FC, ReactNode, useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  Form,
  Formik,
  Field,
  ErrorMessage,
  FormikErrors,
  FieldProps,
} from "formik";
import * as Yup from "yup";
import { AuthApiError } from "@supabase/supabase-js";
import { updateProfile } from "../services/profiles";
import { NumericFormat } from "react-number-format";

export const Route = createFileRoute("/login")({
  component: () => <Login />,

  validateSearch: (search: { next?: string }) => {
    return {
      next: search.next,
    };
  },
});

interface FormValues {
  phoneNumber: string;
  verificationCode: string;
  name: string;
  income: number;
}

const STEP_CONFIG: {
  field: keyof FormValues;
  title: string;
  placeholder: string | ((type: "monthly" | "annual") => string);
}[] = [
  {
    field: "phoneNumber",
    title: "Phone",
    placeholder: "+1234567890",
  },
  {
    field: "verificationCode",
    title: "Verification Code",
    placeholder: "123456",
  },
  {
    field: "name",
    title: "Name",
    placeholder: "John Doe",
  },
  {
    field: "income",
    title: "Income",
    placeholder: (type) => (type === "monthly" ? "$10,000" : "$100,000"),
  },
];

const Login: FC = () => {
  const { signInByPhone, verifyOtp, session, userProfile, setUserProfile } =
    useContext(AuthContext);

  const { next } = Route.useSearch();

  const [step, setStep] = useState(session ? 3 : 1);
  const [incomeType, setIncomeType] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const currentStepConfig = STEP_CONFIG[step - 1];

  const handleSubmit = async (
    values: FormValues,
    setErrors: (errors: FormikErrors<FormValues>) => void
  ) => {
    const userID = session?.user.id;
    const phone = session?.user.phone;

    setLoading(true);
    try {
      switch (currentStepConfig.field) {
        case "phoneNumber":
          await signInByPhone(values.phoneNumber);
          break;
        case "verificationCode":
          await verifyOtp(values.phoneNumber, values.verificationCode);

          break;
        case "name": {
          if (!userID || !values.name || !phone) {
            return;
          }
          const result = await updateProfile({
            name: values.name,
            id: userID,
            phone: phone,
          });

          setUserProfile(result);
          break;
        }
        case "income":
          {
            if (!userID || !values.income || !phone) {
              return;
            }

            const annualizedIncome =
              incomeType === "monthly" ? values.income * 12 : values.income;

            const result = await updateProfile({
              annualized_income: annualizedIncome,
              id: userID,
              phone: phone,
            });

            setUserProfile(result);

            if (next) {
              navigate({
                to: next,
              });
            } else {
              navigate({
                to: "/",
              });
            }
          }
          break;
        default:
          break;
      }

      if (step < 4) {
        setStep(step + 1);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof AuthApiError) {
        setErrors({ [currentStepConfig.field]: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-antic text-white text-5xl">pact</h1>
      <Formik
        initialValues={{
          phoneNumber:
            session && session.user.phone ? `+${session.user.phone}` : "",
          verificationCode: "",
          name: userProfile && userProfile.name ? userProfile.name : "",
          income:
            userProfile && userProfile.annualized_income
              ? userProfile.annualized_income
              : incomeType == "annual"
                ? 100000
                : 10000,
          incomeType: "annual",
        }}
        validationSchema={validationSchema[step - 1]}
        onSubmit={(values, { setErrors }) => {
          handleSubmit(values, setErrors);
        }}
        enableReinitialize
      >
        {({ setFieldError }) => (
          <Form>
            <InputCard
              title={currentStepConfig.title}
              loading={loading}
              onPrev={step > 1 ? () => setStep(step - 1) : undefined}
              onChange={() => {
                setFieldError(currentStepConfig.field, undefined);
              }}
              isFinal={step === STEP_CONFIG.length}
              fields={<>{getFieldsForStep(step, incomeType, setIncomeType)}</>}
            />
          </Form>
        )}
      </Formik>
    </>
  );
};

const validationSchema = [
  Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Phone Number is required")
      .matches(
        /^\+[1-9]\d{9,14}$/,
        "Phone number must be in the format +1234567890"
      ),
  }),
  Yup.object().shape({
    verificationCode: Yup.string()
      .required("Verification Code is required")
      .matches(/^\d{6}$/, "Verification Code must be 6 digits"),
  }),
  Yup.object().shape({
    name: Yup.string().required("Name is required"),
  }),
  Yup.object().shape({
    income: Yup.string()
      .required("Income is required")
      .matches(
        /^\$?\s?((\d{1,3})(,\d{3})*(\.\d{2})?|\d+)(\s?\$\s?|\s?€\s?|\s?£\s?)?$/,
        {
          message: "Income must be a valid number",
          excludeEmptyString: true,
        }
      ),
  }),
];

const InputCard: React.FC<{
  title: string;
  fields: ReactNode;
  isFinal: boolean;
  onPrev?: () => void;
  onChange: () => void;
  loading?: boolean;
}> = ({ title, loading, fields, onPrev, isFinal, onChange }) => {
  return (
    <div className="mt-4 p-4 bg-white shadow-lg rounded-lg w-96  flex flex-col justify-between">
      <h1 className="text-lg font-semibold text-gray-800 mb-2">{title}</h1>
      <div className="flex flex-col flex-grow relative justify-between">
        {fields}
        <div className={`flex justify-between mt-4`}>
          <div>
            {onPrev && (
              <button
                type="button"
                className={`py-2 px-4 rounded-lg bg-gradientEnd text-white`}
                onClick={() => {
                  onPrev && onPrev();
                  onChange();
                }}
              >
                Back
              </button>
            )}
          </div>

          <button
            type="submit"
            className={`py-2 px-4 rounded-lg ${
              loading
                ? "bg-gray-300 text-gray-500"
                : "bg-gradientEnd text-white"
            } ml-auto`}
            disabled={loading}
            onClick={() => {
              onChange();
            }}
          >
            {isFinal ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

const getFieldsForStep = (
  step: number,
  incomeType: "monthly" | "annual",
  setIncomeType: (type: "monthly" | "annual") => void
) => {
  const currentStepConfig = STEP_CONFIG[step - 1];

  switch (currentStepConfig.field) {
    case "phoneNumber":
    case "verificationCode":
    case "name":
      return (
        <div className="flex flex-col flex-grow relative mb-4">
          <Field
            type={currentStepConfig.field === "phoneNumber" ? "tel" : "text "}
            name={currentStepConfig.field}
            placeholder={currentStepConfig.placeholder}
            className="w-full p-2 border border-gray-300 rounded-lg outline-gradientEnd "
          />
          <ErrorMessage
            name={currentStepConfig.field}
            component="div"
            className="absolute left-0 bottom-0 mt-4 text-xs text-red-500 whitespace-nowrap overflow-x-auto max-w-full"
          />
        </div>
      );

    case "income": {
      const placeholder =
        typeof currentStepConfig.placeholder === "function"
          ? currentStepConfig.placeholder(incomeType)
          : currentStepConfig.placeholder;
      return (
        <div className="flex flex-col flex-grow relative mb-4">
          <Field name={currentStepConfig.field}>
            {({ field, form }: FieldProps<FormValues>) => (
              <>
                <NumericFormat
                  placeholder={placeholder}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  thousandSeparator={true}
                  prefix={"$"}
                  allowNegative={false}
                  onValueChange={(values) => {
                    form.setFieldValue(field.name, values.floatValue);
                  }}
                  value={form.values.income}
                />
                <Field name="incomeType">
                  {() => (
                    <div className="flex items-center mt-2">
                      <span className="mr-2">Income Type:</span>
                      <label className="inline-flex items-center mr-2">
                        <input
                          type="radio"
                          name="incomeType"
                          value="monthly"
                          checked={incomeType === "monthly"}
                          onChange={(e) =>
                            setIncomeType(
                              e.target.value as "monthly" | "annual"
                            )
                          }
                          className="mr-1 checked:text-gradientEnd focus:outline-gradientEnd checked:border-transparent"
                        />
                        <span className="ml-1">Monthly</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="incomeType"
                          value="annual"
                          checked={incomeType === "annual"}
                          onChange={(e) =>
                            setIncomeType(
                              e.target.value as "monthly" | "annual"
                            )
                          }
                          className="mr-1 checked:text-gradientEnd focus:outline-gradientEnd checked:border-transparent"
                        />
                        <span className="ml-1">Annual</span>
                      </label>
                    </div>
                  )}
                </Field>
              </>
            )}
          </Field>

          <ErrorMessage
            name={currentStepConfig.field}
            component="div"
            className="text-red-500 text-sm"
          />
        </div>
      );
    }

    default:
      return null;
  }
};
