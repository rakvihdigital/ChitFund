"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { msg, useT } from "@/lib/i18n";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
export function ChitCalculator() {
  const { t } = useT();
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
          <span className="eyebrow">{t("YOUR SAVINGS, YOUR PACE")}</span>
          <h3>{t("Chit Dividend & Prize Money Estimator")}</h3>
          <p>{t("Simulate auction discount bidding, take-home prize money (\"Get My Amount\"), and monthly dividend savings")}</p>
          <span className="calculator-tag">{t("Chit Funds Act 1982 Formula")}</span>
        </div>
        <div className="calc-field">
          <div className="calc-label">
            <label htmlFor="chit-value">{t("Total chit value")}</label>
            <output htmlFor="chit-value">{currency(value)}</output>
          </div>
          <div className="preset-row">
            {[100000, 250000, 500000, 1000000].map((n) => (
              <button
                key={n}
                aria-pressed={value === n}
                onClick={() => setValue(n)}
              >
                {t("₹{amount} lakh", { amount: n / 100000 })}
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
          <legend>{t("Scheme Duration & Members")}</legend>
          <p className="calc-hint">{t("{count} Months ({count} Subscribers)", { count: months })}</p>
          <div className="preset-row duration-row">
            {[20, 25, 40].map((n) => (
              <button
                key={n}
                aria-pressed={months === n}
                onClick={() => setMonths(n)}
              >
                {t("{count} Months ({count} Seats)", { count: n })}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="calc-field">
          <div className="calc-label">
            <label htmlFor="auction-discount">{t("Auction Bid Discount You Forego")}</label>
            <output htmlFor="auction-discount">{t("{amount} · {percent}% of Chit Value", { amount: currency(auctionDiscountAmount), percent: discount })}</output>
          </div>
          <p className="calc-hint">
            {t("The discount bid you offer in auction to take the prize money early.")}
          </p>
          <div className="preset-row discount-row">
            {([[5, msg("5% (Min)")], [15, msg("15% (Low)")], [20, msg("20% (Avg)")], [30, msg("30% (Max)")]] as const).map(([n, label]) => (
              <button key={n} aria-pressed={discount === n} onClick={() => setDiscount(n)}>{t(label)}</button>
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
            <span>{t("5% (Statutory Minimum Bid)")}</span>
            <span>{t("30% (Statutory Cap)")}</span>
          </div>
        </div>
      </div>
      <div className="calculator-result" data-home-reveal="right" aria-live="polite" aria-atomic="true">
        <div className="result-heading">
          <span>{t("YOUR NET PRIZE MONEY (\"GET MY AMOUNT\")")}</span>
        </div>
        <div className="payout-value">
          {currency(value * (1 - discount / 100))}
        </div>
        <p>{t("Chit Value ({value}) minus Bid Discount ({discount}).", { value: currency(value), discount: currency(auctionDiscountAmount) })}</p>
        <div className="result-divider" />
        <dl>
          <div>
            <dt>{t("Dividend Generated For Members")}</dt>
            <dd>{t("{amount} Pool", { amount: currency(dividendPool) })}</dd>
          </div>
          <div>
            <dt>{t("Gross Monthly Dues")}</dt>
            <dd>{currency(monthly)}</dd>
          </div>
          <div>
            <dt>{t("Monthly Dividend Discount")}</dt>
            <dd className="dividend">{t("− {amount} / member", { amount: currency(dividend) })}</dd>
          </div>
          <div className="net-result">
            <dt>{t("Net Dues Each Member Pays")}</dt>
            <dd>{currency(monthly - dividend)}</dd>
          </div>
          <div>
            <dt>{t("Foreman Commission (5% fixed)")}</dt>
            <dd>{currency(fee)}</dd>
          </div>
          <div>
            <dt>{t("Total Members Sharing Dividend")}</dt>
            <dd>{t("{count} Subscribers", { count: months })}</dd>
          </div>
        </dl>
        <div className="calculator-disclaimer">
          <Info size={16} />
          <p>
            {t("Illustration only. Assumes a 5% foreman fee and {count} members. Actual payouts and dividends depend on auction results and scheme terms.", { count: months })}
          </p>
        </div>
        <div className="calculator-law-note">
          <span>{t("* Governed under Central Chit Funds Act 1982")}</span>
          <span>{t("ChitFund Solutions Pvt Ltd")}</span>
        </div>
      </div>
    </div>
  );
}
