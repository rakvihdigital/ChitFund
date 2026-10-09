'use client';

import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle, Percent, DollarSign, Sparkles } from 'lucide-react';

export const ChitCalculator: React.FC = () => {
  const [chitValue, setChitValue] = useState<number>(100000);
  const [durationMonths, setDurationMonths] = useState<number>(20);
  const [expectedAvgDiscountPercent, setExpectedAvgDiscountPercent] = useState<number>(20);

  const baseMonthlyContribution = chitValue / durationMonths;
  const totalMembers = durationMonths;

  // Foreman Commission = 5% of Chit Value
  const foremanFee = (chitValue * 5) / 100;

  // Total Auction Discount = Chit Value * expectedAvgDiscountPercent / 100
  const auctionDiscountAmount = (chitValue * expectedAvgDiscountPercent) / 100;

  // Dividend Pool = Auction Discount - Foreman Fee
  const totalDividendPool = Math.max(0, auctionDiscountAmount - foremanFee);

  // Dividend per member = Total Dividend Pool / totalMembers
  const dividendPerMember = Math.floor(totalDividendPool / totalMembers);

  // Net payable monthly instalment by member
  const netMonthlyInstalment = baseMonthlyContribution - dividendPerMember;

  // Net Prize money received by Winner
  const winnerNetPayout = chitValue - auctionDiscountAmount;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 card-shadow">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-amber-50 rounded-2xl text-[#d97706]">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Interactive Chit Estimator</h2>
          <p className="text-xs text-gray-500">
            Calculate your monthly savings, dividend returns, and payout estimates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Sliders */}
        <div className="space-y-6">
          {/* Total Chit Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Total Chit Value
              </label>
              <span className="text-lg font-extrabold text-[#4d5d30]">
                ₹{chitValue.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={50000}
              max={2500000}
              step={50000}
              value={chitValue}
              onChange={(e) => setChitValue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4d5d30]"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
              <span>₹50,000</span>
              <span>₹10 Lakh</span>
              <span>₹25 Lakh</span>
            </div>
          </div>

          {/* Duration Months */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Duration / Total Members
              </label>
              <span className="text-lg font-bold text-gray-900">{durationMonths} Months</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[20, 25, 40].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                    durationMonths === m
                      ? 'bg-[#4d5d30] text-white border-[#4d5d30] shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {m} Months ({m} Members)
                </button>
              ))}
            </div>
          </div>

          {/* Average Winning Auction Bid Discount % */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Est. Auction Winning Bid Discount %
              </label>
              <span className="text-sm font-bold text-amber-600">{expectedAvgDiscountPercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={expectedAvgDiscountPercent}
              onChange={(e) => setExpectedAvgDiscountPercent(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
              <span>5% (Min Regulated)</span>
              <span>20% (Avg)</span>
              <span>30% (Max Allowed)</span>
            </div>
          </div>
        </div>

        {/* Output Calculation Cards */}
        <div className="bg-[#f2f5ed] rounded-2xl p-6 flex flex-col justify-between border border-[#e2e8d5]">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#374421] uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Chit Financial Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[11px] text-gray-500 font-medium block">Gross Monthly Dues</span>
                <span className="text-base font-bold text-gray-900">
                  ₹{baseMonthlyContribution.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[11px] text-gray-500 font-medium block">Est. Dividend / Month</span>
                <span className="text-base font-bold text-emerald-600">
                  + ₹{dividendPerMember.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700">Net Monthly Contribution</span>
                <span className="text-xl font-extrabold text-[#4d5d30]">
                  ₹{netMonthlyInstalment.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                You pay less than gross dues thanks to monthly auction dividend distributions among all subscribers.
              </p>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900">Winner Net Prize Payout</span>
                <span className="text-lg font-black text-amber-700">
                  ₹{winnerNetPayout.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-tight">
                Amount received by highest bidding subscriber after bid discount deduction. Foreman Fee: 5% (₹
                {foremanFee.toLocaleString('en-IN')}).
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 text-[10px] text-gray-500 flex items-center justify-between">
            <span>* Compliant with Govt Chit Funds Act 1982</span>
            <span className="font-semibold text-[#4d5d30]">RAKVIH Solutions Private Limited</span>
          </div>
        </div>
      </div>
    </div>
  );
};
