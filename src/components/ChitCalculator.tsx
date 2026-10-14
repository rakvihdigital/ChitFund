'use client';

import React, { useState } from 'react';
import {
  Calculator,
  ArrowRight,
  Sparkles,
  Award,
  TrendingDown,
  Gift,
  HelpCircle,
  Coins
} from 'lucide-react';

export const ChitCalculator: React.FC = () => {
  const [chitValue, setChitValue] = useState<number>(100000);
  const [durationMonths, setDurationMonths] = useState<number>(20);
  const [discountPercent, setDiscountPercent] = useState<number>(20);

  const baseMonthlyContribution = chitValue / durationMonths;
  const totalMembers = durationMonths;

  // Foreman Commission = 5% of Chit Value (statutory limit under Chit Funds Act 1982)
  const foremanFee = (chitValue * 5) / 100;

  // Auction Bid Discount offered by the winning bidder
  const auctionDiscountAmount = Math.round((chitValue * discountPercent) / 100);

  // Take-home Prize Amount received by the winner ("Get My Amount")
  const winnerNetPayout = chitValue - auctionDiscountAmount;

  // Dividend Pool = Auction Discount - Foreman Fee
  const totalDividendPool = Math.max(0, auctionDiscountAmount - foremanFee);

  // Monthly Dividend earned per subscriber
  const dividendPerMember = Math.floor(totalDividendPool / totalMembers);

  // Net payable monthly instalment after dividend deduction
  const netMonthlyInstalment = baseMonthlyContribution - dividendPerMember;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 card-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span>Chit Dividend & Prize Money Estimator</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-xs text-gray-500">
              Simulate auction discount bidding, take-home prize money (&quot;Get My Amount&quot;), and monthly dividend savings
            </p>
          </div>
        </div>

        <div className="inline-flex items-center space-x-2 bg-[#f0f4e8] border border-[#d2dfbd] px-3 py-1.5 rounded-full text-xs font-bold text-[#374421]">
          <Coins className="w-4 h-4 text-amber-500" />
          <span>Chit Funds Act 1982 Formula</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Chit Value */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                1. Select Chit Value
              </label>
              <span className="text-xl font-black text-[#374421]">
                ₹{chitValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[100000, 250000, 500000, 1000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setChitValue(val)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    chitValue === val
                      ? 'bg-[#374421] text-white border-[#374421] shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ₹{(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)} Lakh
                </button>
              ))}
            </div>
            <input
              type="range"
              min={50000}
              max={2500000}
              step={25000}
              value={chitValue}
              onChange={(e) => setChitValue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#374421]"
            />
          </div>

          {/* Step 2: Duration / Members */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Scheme Duration & Members
              </label>
              <span className="text-sm font-bold text-gray-900">
                {durationMonths} Months ({durationMonths} Subscribers)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[20, 25, 40].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    durationMonths === m
                      ? 'bg-[#374421] text-white border-[#374421] shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {m} Months ({m} Seats)
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Auction Bid Discount */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-amber-950 flex items-center space-x-1">
                  <span>3. Auction Bid Discount You Forego</span>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                </label>
                <span className="text-[11px] text-amber-800">
                  The discount bid you offer in auction to take the prize money early
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-700 block">
                  ₹{auctionDiscountAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                  {discountPercent}% of Chit Value
                </span>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { label: '5% (Min)', val: 5 },
                { label: '15% (Low)', val: 15 },
                { label: '20% (Avg)', val: 20 },
                { label: '30% (Max)', val: 30 }
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setDiscountPercent(p.val)}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                    discountPercent === p.val
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-amber-800 font-medium">
              <span>5% (Statutory Minimum Bid)</span>
              <span>30% (Statutory Cap)</span>
            </div>
          </div>
        </div>

        {/* Right Output Calculation Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-[#f4f7ef] rounded-2xl p-6 flex flex-col justify-between border border-[#dce5cf] space-y-5">
          <div className="space-y-4">
            {/* BIG PROMINENT RESULT: "GET MY AMOUNT" */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-md text-center space-y-1 relative overflow-hidden">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your Net Prize Money (&quot;Get My Amount&quot;)</span>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-[#2f3b1b] tracking-tight">
                ₹{winnerNetPayout.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Chit Value (₹{chitValue.toLocaleString('en-IN')}) minus Bid Discount (₹{auctionDiscountAmount.toLocaleString('en-IN')})
              </p>
            </div>

            {/* DIVIDEND DISCOUNT BREAKDOWN CARD */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dividend Generated For Members</span>
                </span>
                <span className="text-emerald-700 font-extrabold text-xs">
                  ₹{totalDividendPool.toLocaleString('en-IN')} Pool
                </span>
              </h4>

              <div className="space-y-2 text-xs pt-1 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Gross Monthly Dues:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{baseMonthlyContribution.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 p-2 rounded-lg">
                  <span className="flex items-center space-x-1">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Monthly Dividend Discount:</span>
                  </span>
                  <span>- ₹{dividendPerMember.toLocaleString('en-IN')} / member</span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                  <div>
                    <span className="font-bold text-gray-900 flex items-center space-x-1">
                      <span>Net Dues Each Member Pays:</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#374421]" />
                    </span>
                    <span className="text-[10px] text-gray-400">
                      (Gross ₹{baseMonthlyContribution} - Dividend ₹{dividendPerMember})
                    </span>
                  </div>
                  <span className="text-base font-black text-[#374421]">
                    ₹{netMonthlyInstalment.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory Transparency Box */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Foreman Commission (5% fixed):</span>
                <span className="font-bold text-gray-900">₹{foremanFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Members Sharing Dividend:</span>
                <span className="font-bold text-gray-900">{totalMembers} Subscribers</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#dce5cf] text-[10px] text-gray-500 flex items-center justify-between">
            <span>* Governed under Central Chit Funds Act 1982</span>
            <span className="font-bold text-[#374421]">RAKVIH Solutions Pvt Ltd</span>
          </div>
        </div>
      </div>
    </div>
  );
};
