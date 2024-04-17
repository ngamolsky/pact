import { createFileRoute } from "@tanstack/react-router";
import {
  getProfile,
  searchProfileByPhonePrefix,
} from "../../services/profiles";
import { Form, Formik, FormikProps } from "formik";
import { debounce } from "lodash";
import { Combobox, Transition } from "@headlessui/react";
import { useEffect, useState, Fragment } from "react";
import { PhoneInput } from "../../components/phoneInput";
import { Tables } from "../../types/supabase";
import { NumericFormat } from "react-number-format";
import { CheckIcon } from "@heroicons/react/24/solid";
import { formatPhoneNumber } from "../../utils";

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
  profiles: Tables<"profiles">[],
  shareAllocation: number
): ProfileWithShare[] => {
  const totalIncome = profiles.reduce((sum, profile) => {
    return sum + (profile.annualized_income ?? 0);
  }, 0);

  return profiles.map((profile) => {
    const income = profile.annualized_income ?? 0;
    const incomeBasedShare =
      totalIncome > 0 ? (income / totalIncome) * totalExpense : 0;
    const equalShare = totalExpense / profiles.length;
    const share =
      (1 - shareAllocation) * incomeBasedShare + shareAllocation * equalShare;
    const sharePercentage = (share / totalExpense) * 100;
    return {
      ...profile,
      share: share,
      sharePercentage: sharePercentage,
    };
  });
};

const Index = () => {
  const currentProfile = Route.useLoaderData().profile;

  const [selected, setSelected] = useState<Tables<"profiles">[]>([
    currentProfile,
  ]);
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Tables<"profiles">[]>([]);
  const [totalExpenseStr, setTotalExpenseStr] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [profileShares, setProfileShares] = useState<ProfileWithShare[]>([]);
  const [shareAllocation, setShareAllocation] = useState(0);

  const totalExpense = parseFloat(totalExpenseStr) || 0;

  useEffect(() => {
    debounceFetch(query, setResults);
  }, [query]);

  useEffect(() => {
    if (selected.length > 0 && totalExpense > 0) {
      setProfileShares(
        calculateShares(totalExpense, selected, shareAllocation)
      );
    }
  }, [selected, shareAllocation, totalExpense]);

  const handleProfileSelect = (profile: Tables<"profiles">) => {
    if (!selected.some((p) => p.id === profile.id)) {
      setSelected([...selected, profile]);
      setQuery("");
      setResults([]);
    }
  };

  const handleVenmoRequest = async (
    type: "pay" | "charge",
    share: number,
    phoneNumber: string
  ) => {
    console.log(encodeURIComponent(expenseName));

    const venmoUrl = `https://venmo.com/?txn=${type}&recipients=${phoneNumber}&amount=${share}&note=${encodeURIComponent(expenseName)}`;
    window.open(venmoUrl, "_blank", "noopener,noreferrer");
  };

  const isButtonDisabled = (profile: Tables<"profiles">) => {
    return (
      profile.id === currentProfile.id ||
      totalExpense === 0 ||
      expenseName.trim() === ""
    );
  };

  return (
    <div className="flex flex-col inset-0 h-full p-4 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
      <Formik
        initialValues={{ phoneNumber: "", totalExpense: "", expenseName: "" }}
        onSubmit={() => {}}
      >
        {({
          setFieldValue,
        }: FormikProps<{
          phoneNumber: string;
          totalExpense: string;
          expenseName: string;
        }>) => (
          <Form>
            <div className="mb-4">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Recipient Phone
              </label>
              <Combobox<Tables<"profiles">>
                value={selected}
                onChange={() => {
                  setQuery("");
                  setResults([]);
                }}
                multiple
              >
                <div className="relative mt-1">
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    <Combobox.Input
                      as={PhoneInput}
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                      onChange={(e) => setQuery(e.target.value)}
                      value={query}
                      shouldValidate={false}
                    />
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery("")}
                  >
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                      {results.map((profile) => (
                        <Combobox.Option
                          key={profile.id}
                          className={({ active }) =>
                            `relative cursor-default select-none p-2 ${
                              active
                                ? "bg-gradientStart text-white"
                                : "text-gray-900"
                            }`
                          }
                          value={profile}
                          onClick={() => handleProfileSelect(profile)}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {formatPhoneNumber(profile.phone)} -{" "}
                                {profile.name}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? "text-white" : "text-teal-600"
                                  }`}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>
            <div className="mb-4">
              <label
                htmlFor="expenseName"
                className="block text-sm font-medium text-gray-700"
              >
                Expense Name
              </label>
              <input
                id="expenseName"
                type="text"
                value={expenseName}
                onChange={(e) => {
                  setExpenseName(e.target.value);
                  setFieldValue("expenseName", e.target.value);
                }}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="totalExpense"
                className="block text-sm font-medium text-gray-700"
              >
                Total Expense ($)
              </label>
              <NumericFormat
                thousandSeparator={true}
                prefix={"$"}
                fixedDecimalScale={true}
                placeholder="$0.00"
                allowNegative={false}
                value={totalExpenseStr}
                onValueChange={(values) => {
                  const { value } = values;
                  setTotalExpenseStr(value);
                  setFieldValue("totalExpense", Number(value) || 0);
                }}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="my-8">
              <label className="block text-sm font-medium text-gray-700">
                Share Allocation
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={shareAllocation}
                  onChange={(e) =>
                    setShareAllocation(parseFloat(e.target.value))
                  }
                  className="w-full mr-4"
                />
              </div>
              <p className="text-sm text-gray-500">
                {`${((1 - shareAllocation) * 100).toFixed(0)}% based on income, ${(
                  shareAllocation * 100
                ).toFixed(0)}% equal share`}
              </p>
            </div>
            <div className="w-full border-collapse">
              <div className="flex justify-between p-2 border-b border-gray-200">
                <span className="text-left">Name</span>
                <span className="text-right">Share</span>
              </div>
              {selected.map((profile) => (
                <Fragment key={profile.id}>
                  <div className="border-b">
                    <div className="flex justify-between p-2  border-gray-200">
                      <span className="text-left">{profile.name}</span>
                      <span className="text-right">
                        ${" "}
                        {profileShares
                          .find((p) => p.id === profile.id)
                          ?.share.toFixed(2) ?? 0}
                      </span>
                    </div>
                    {profile.id !== currentProfile.id && (
                      <div className="flex justify-between p-2 ">
                        <div className="flex justify-between w-full">
                          <button
                            onClick={() =>
                              handleVenmoRequest(
                                "charge",
                                parseFloat(
                                  profileShares
                                    .find((p) => p.id === profile.id)!
                                    .share.toFixed(2)
                                ),
                                profile.phone
                              )
                            }
                            disabled={isButtonDisabled(profile)}
                            className={`bg-gradientStart text-white px-4 py-2 rounded-md mr-2 w-full ${isButtonDisabled(profile) && "opacity-50 cursor-not-allowed"}`}
                          >
                            Request
                          </button>
                          <button
                            onClick={() =>
                              handleVenmoRequest(
                                "pay",
                                parseFloat(
                                  profileShares
                                    .find((p) => p.id === profile.id)!
                                    .share.toFixed(2)
                                ),
                                profile.phone
                              )
                            }
                            disabled={isButtonDisabled(profile)}
                            className={`bg-gradientStart text-white px-4 py-2 rounded-md mr-2 w-full ${isButtonDisabled(profile) && "opacity-50 cursor-not-allowed"}`}
                          >
                            Pay
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Fragment>
              ))}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
