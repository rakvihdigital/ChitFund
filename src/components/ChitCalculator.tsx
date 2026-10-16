"use client";

import { useState } from "react";
import { Info } from "lucide-react";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
export function ChitCalculator() {
  const [value, setValue] = useState(100000);
  const [months, setMonths] = useState(20);
  const [discount, setDiscount] = useState(20);
  const monthly = value / months;
  const fee = value * 0.05;
  const auctionDiscountAmount = Math.round((value * discount) / 100);
  const dividendPool = Math.max(0, auctionDiscountAmount - fee);
  const dividend = Math.floor(
    dividendPool / months,
  );
  return (
    <div className="savings-calculator">
      <div className="calculator-controls" data-home-reveal="left">
        <div className="calculator-title">
          <span className="eyebrow">YOUR SAVINGS, YOUR PACE</span>
          <h3>Chit Dividend &amp; Prize Money Estimator</h3>
          <p>Simulate auction discount bidding, take-home prize money (&quot;Get My Amount&quot;), and monthly dividend savings</p>
          <span className="calculator-tag">Chit Funds Act 1982 Formula</span>
        </div>
        <div className="calc-field">
          <div className="calc-label">
            <label htmlFor="chit-value">Total chit value</label>
            <output htmlFor="chit-value">{currency(value)}</output>
          </div>
          <div className="preset-row">
            {[100000, 250000, 500000, 1000000].map((n) => (
              <button
                key={n}
                aria-pressed={value === n}
                onClick={() => setValue(n)}
              >
                ₹{n / 100000} lakh
              </button>
            ))}
          </div>
          <input
            id="chit-value"
            type="range"
            min={50000}
            max={2500000}
            step={25000}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <div className="range-captions">
            <span>₹50,000</span>
            <span>₹25,00,000</span>
          </div>
        </div>
        <fieldset className="calc-field">
          <legend>Scheme Duration &amp; Members</legend>
          <p className="calc-hint">{months} Months ({months} Subscribers)</p>
          <div className="preset-row duration-row">
            {[20, 25, 40].map((n) => (
              <button
                key={n}
                aria-pressed={months === n}
                onClick={() => setMonths(n)}
              >
                {n} Months ({n} Seats)
              </button>
            ))}
          </div>
        </fieldset>
        <div className="calc-field">
          <div className="calc-label">
            <label htmlFor="auction-discount">Auction Bid Discount You Forego</label>
            <output htmlFor="auction-discount">{currency(auctionDiscountAmount)} · {discount}% of Chit Value</output>
          </div>
          <p className="calc-hint">
            The discount bid you offer in auction to take the prize money early.
          </p>
          <div className="preset-row discount-row">
            {[[5, "5% (Min)"], [15, "15% (Low)"], [20, "20% (Avg)"], [30, "30% (Max)"]] .map(([n, label]) => (
              <button key={n} aria-pressed={discount === n} onClick={() => setDiscount(Number(n))}>{label}</button>
            ))}
          </div>
          <input
            id="auction-discount"
            type="range"
            min={5}
            max={30}
            step={1}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
          <div className="range-captions">
            <span>5% (Statutory Minimum Bid)</span>
            <span>30% (Statutory Cap)</span>
          </div>
        </div>
      </div>
      <div className="calculator-result" data-home-reveal="right" aria-live="polite" aria-atomic="true">
        <div className="result-heading">
          <span>YOUR NET PRIZE MONEY (&quot;GET MY AMOUNT&quot;)</span>
        </div>
        <div className="payout-value">
          {currency(value * (1 - discount / 100))}
        </div>
        <p>Chit Value ({currency(value)}) minus Bid Discount ({currency(auctionDiscountAmount)}).</p>
        <div className="result-divider" />
        <dl>
          <div>
            <dt>Dividend Generated For Members</dt>
            <dd>{currency(dividendPool)} Pool</dd>
          </div>
          <div>
            <dt>Gross Monthly Dues</dt>
            <dd>{currency(monthly)}</dd>
          </div>
          <div>
            <dt>Monthly Dividend Discount</dt>
            <dd className="dividend">− {currency(dividend)} / member</dd>
          </div>
          <div className="net-result">
            <dt>Net Dues Each Member Pays</dt>
            <dd>{currency(monthly - dividend)}</dd>
          </div>
          <div>
            <dt>Foreman Commission (5% fixed)</dt>
            <dd>{currency(fee)}</dd>
          </div>
          <div>
            <dt>Total Members Sharing Dividend</dt>
            <dd>{months} Subscribers</dd>
          </div>
        </dl>
        <div className="calculator-disclaimer">
          <Info size={16} />
          <p>
            Illustration only. Assumes a 5% foreman fee and {months} members.
            Actual payouts and dividends depend on auction results and scheme
            terms.
          </p>
        </div>
        <div className="calculator-law-note">
          <span>* Governed under Central Chit Funds Act 1982</span>
          <span>RAKVIH Solutions Pvt Ltd</span>
        </div>
      </div>
    </div>
  );
}
