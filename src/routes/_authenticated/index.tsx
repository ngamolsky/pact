import { createFileRoute } from "@tanstack/react-router";
import {
  getProfile,
  searchProfileByPhonePrefix,
} from "../../services/profiles";
import { Form, Formik, Field } from "formik";
import { debounce } from "lodash";
import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { PhoneInput } from "../../components/phoneInput";
import { Tables } from "../../types/supabase";

export const Route = createFileRoute("/_authenticated/")({
  component: () => <Index />,
  loader: async ({ context }) => {
    const profile = await getProfile(context.session!.user.id);
    return { profile };
  },
});

interface ProfileWithShare extends Tables<"profiles"> {
  share: number;
}

const debounceFetch = debounce(
  async (
    prefix: string,
    setResult: (results: Tables<"profiles">[]) => void
  ) => {
    if (prefix) {
      const results = await searchProfileByPhonePrefix(`1${prefix}`);
      setResult(results);
    } else {
      setResult([]);
    }
  },
  500
);

const calculateShares = (
  totalExpense: number,
  profiles: Tables<"profiles">[]
): ProfileWithShare[] => {
  const totalIncome = profiles.reduce((sum, profile) => {
    return sum + (profile.annualized_income ?? 0);
  }, 0);

  return profiles.map((profile) => {
    const income = profile.annualized_income ?? 0;
    const share = totalIncome > 0 ? (income / totalIncome) * totalExpense : 0;
    return {
      ...profile,
      share: share,
    };
  });
};

const Index = () => {
  const [selected, setSelected] = useState<Tables<"profiles">[]>([]);
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Tables<"profiles">[]>([]);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [profileShares, setProfileShares] = useState<ProfileWithShare[]>([]);

  useEffect(() => {
    debounceFetch(query, setResults);
  }, [query]);

  useEffect(() => {
    if (selected.length > 0 && totalExpense > 0) {
      setProfileShares(calculateShares(totalExpense, selected));
    }
  }, [selected, totalExpense]);

  return (
    <div className="flex flex-col inset-0 h-full p-4 bg-white shadow-lg rounded-lg">
      <Formik
        initialValues={{ phoneNumber: "", totalExpense: "" }}
        onSubmit={() => {}}
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
              <Combobox<Tables<"profiles">>
                value={selected}
                onChange={setSelected}
                multiple
              >
                <Combobox.Input
                  as={PhoneInput}
                  onChange={(e) => setQuery(e.target.value)}
                  value={query}
                  shouldValidate={false}
                />
                <Combobox.Options>
                  {results.map((profile) => (
                    <Combobox.Option key={profile.id} value={profile}>
                      {({ active }) => (
                        <div
                          className={`p-2 ${active ? "bg-blue-500 text-white" : "bg-white"}`}
                        >
                          {profile.phone} - {profile.name}
                        </div>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox>
            </div>
            <div className="mb-4">
              <label
                htmlFor="totalExpense"
                className="block text-sm font-medium text-gray-700"
              >
                Total Expense ($)
              </label>
              <Field
                name="totalExpense"
                type="number"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTotalExpense(Number(e.target.value))
                }
                value={totalExpense}
              />
            </div>
            {profileShares.map((profile) => (
              <div key={profile.id} className="p-2 border-b border-gray-200">
                {profile.name} - Share: ${profile.share.toFixed(2)}
              </div>
            ))}
          </Form>
        )}
      </Formik>
    </div>
  );
};
