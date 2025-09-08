import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    expenseCategories: {},
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/transactions/summary");
        const data = res.data;

        // Extract totals from backend "summary"
        let totalIncome = 0;
        let totalExpense = 0;
        if (data.summary && Array.isArray(data.summary)) {
          totalIncome =
            data.summary.find((s) => s._id === "income")?.total || 0;
          totalExpense =
            data.summary.find((s) => s._id === "expense")?.total || 0;
        }

        // Convert categoryBreakdown (array) to object { category: total }
        const expenseCategories = {};
        if (data.categoryBreakdown && Array.isArray(data.categoryBreakdown)) {
          data.categoryBreakdown.forEach((c) => {
            expenseCategories[c._id] = c.total;
          });
        }

        setSummary({
          totalIncome,
          totalExpense,
          netIncome: data.netIncome || 0,
          expenseCategories,
        });
      } catch (err) {
        console.error("Error fetching summary", err);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Income */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Income
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(summary.totalIncome)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <ArrowTrendingDownIcon className="h-6 w-6 text-red-400" />
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Expense
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(summary.totalExpense)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-400" />
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Net Balance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(summary.netIncome)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div
              className={`text-sm ${
                summary.netIncome >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {summary.netIncome >= 0 ? "In Profit" : "In Deficit"}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Expense Breakdown
        </h2>
        {Object.keys(summary.expenseCategories).length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {Object.entries(summary.expenseCategories).map(
              ([category, amount]) => (
                <li
                  key={category}
                  className="py-3 flex justify-between items-center"
                >
                  <span className="text-gray-700">{category}</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(amount)}
                  </span>
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="text-gray-500">No expenses recorded.</p>
        )}
      </div>
    </div>
  );
}
