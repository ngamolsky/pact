import { createFileRoute } from "@tanstack/react-router";
import { getProfile } from "../../services/profiles";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { getProfileByPhone } from "../../services/profiles";
import { PhoneInput } from "../../components/phoneInput";
import { sanitizePhoneNumber } from "../../utils";

export const Route = createFileRoute("/_authenticated/")({
  component: () => <Index />,
  loader: async ({ context }) => {
    const profile = await getProfile(context.session!.user.id);
    return { profile };
  },
});

const Index = () => {
  const handleValidPhoneNumber = async (phone: string) => {
    try {
      const sanitizedPhone = sanitizePhoneNumber(phone);
      const profile = await getProfileByPhone(sanitizedPhone);
      console.log(profile); // Do something with the profile, e.g., update form values or state
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <div className="m-4 p-4 bg-white shadow-lg rounded-lg flex flex-col justify-between w-96">
        <Formik
          initialValues={{
            phoneNumber: "",
            expenseName: "",
            expenseAmount: "",
          }}
          onSubmit={(values) => {
            console.log(values);
          }}
        >
          {() => (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <PhoneInput onValidPhoneNumber={handleValidPhoneNumber} />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="expenseName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Expense Name
                </label>
                <Field
                  type="text"
                  name="expenseName"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <ErrorMessage
                  name="expenseName"
                  component="div"
                  className="text-red-500 text-xs italic"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="expenseAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Expense Amount
                </label>
                <Field
                  type="number"
                  name="expenseAmount"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <ErrorMessage
                  name="expenseAmount"
                  component="div"
                  className="text-red-500 text-xs italic"
                />
              </div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
