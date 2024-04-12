import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FC, useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Form, Formik, Field, ErrorMessage, FormikErrors } from "formik";
import * as Yup from "yup";
import { AuthApiError } from "@supabase/supabase-js";
import { updateProfile } from "../services/profiles";

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

const STEP_TO_FIELD_MAP: {
  [key: number]: {
    field: keyof FormValues;
    placeholder: string;
  };
} = {
  1: {
    field: "phoneNumber",
    placeholder: "+1234567890",
  },
  2: {
    field: "verificationCode",
    placeholder: "123456",
  },
  3: {
    field: "name",
    placeholder: "John Doe",
  },
  4: {
    field: "income",
    placeholder: "100,000",
  },
};

const Login: FC = () => {
  const { signInByPhone, verifyOtp, session, userProfile, setUserProfile } =
    useContext(AuthContext);

  const { next } = Route.useSearch();

  const [step, setStep] = useState(session ? 3 : 1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (
    values: FormValues,
    setErrors: (errors: FormikErrors<FormValues>) => void
  ) => {
    const userID = session?.user.id;

    setLoading(true);
    try {
      switch (step) {
        case 1:
          try {
            await signInByPhone(values.phoneNumber);
          } catch (error) {
            if (error instanceof AuthApiError) {
              setErrors({ phoneNumber: error.message });
            }
          }
          break;
        case 2:
          await verifyOtp(values.phoneNumber, values.verificationCode);

          break;
        case 3: {
          if (!userID) {
            return;
          }
          const result = await updateProfile(userID, {
            name: values.name,
          });

          setUserProfile(result);
          break;
        }
        case 4:
          {
            if (!userID || !values.income) {
              return;
            }

            const result = await updateProfile(userID, {
              annualized_income: values.income,
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
    } catch (error) {
      console.error(error);
      if (error instanceof AuthApiError) {
        setErrors({ verificationCode: error.message });
      }
    } finally {
      setLoading(false);
      if (step < 4) {
        setStep(step + 1);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center w-full bg-gradient-blue">
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
              : 1000000,
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
              inputType={step === 1 ? "tel" : "text"}
              name={STEP_TO_FIELD_MAP[step].field}
              placeholder={STEP_TO_FIELD_MAP[step].placeholder}
              step={step}
              setCurrentStep={setStep}
              loading={loading}
              setFieldError={setFieldError}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
};

const validationSchema = [
  Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Phone Number is required")
      .matches(
        /^\+[1-9]\d{1,14}$/,
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
    income: Yup.string().required("Income is required").matches(/^\d+$/, {
      message: "Income must be a number",
      excludeEmptyString: true,
    }),
  }),
];

const InputCard: React.FC<{
  inputType: "tel" | "text";
  name: string;
  placeholder: string;
  step: number;
  setCurrentStep: (step: number) => void;
  setFieldError: (field: string, message: string | undefined) => void;
  loading?: boolean;
}> = ({
  inputType,
  name,
  placeholder,
  setCurrentStep,
  step,
  setFieldError,
  loading,
}) => {
  return (
    <div className="mt-4 p-4 bg-white shadow-lg rounded-lg w-96 h-48 flex flex-col justify-between">
      <h1 className="text-lg font-semibold text-gray-800 mb-2">
        {name === "phoneNumber"
          ? "Phone"
          : name === "verificationCode"
            ? "Verification Code"
            : name === "name"
              ? "Name"
              : "Income"}
      </h1>
      <div className="flex flex-col flex-grow relative">
        <Field
          type={inputType}
          name={name}
          placeholder={placeholder}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <ErrorMessage
          name={name}
          component="div"
          className="absolute left-0 bottom-0 mt-4 text-xs text-red-500 whitespace-nowrap overflow-x-auto max-w-full"
        />
      </div>
      <div
        className={`flex justify-between mt-4 ${step > 1 ? "items-center" : "items-end"}`}
      >
        {step > 1 && (
          <button
            type="button"
            onClick={() => {
              setCurrentStep(step - 1);
              setFieldError(name, undefined);
            }}
            className={`py-2 px-4 rounded-lg bg-gradientEnd text-white`}
          >
            Previous
          </button>
        )}
        {step >= 1 && (
          <button
            type="submit"
            className={`py-2 px-4 rounded-lg ${
              loading
                ? "bg-gray-300 text-gray-500"
                : "bg-gradientEnd text-white"
            } ml-auto`}
            disabled={loading}
          >
            {step === 4 ? "Submit" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
};
