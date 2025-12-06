import { CashbackCard } from "../CashbackCard";

export default function CashbackCardExample() {
  return (
    <div className="max-w-md">
      {/* todo: remove mock functionality */}
      <CashbackCard
        availableBalance={245.80}
        pendingBalance={89.50}
        totalEarned={1234.50}
        onWithdraw={() => console.log("Withdraw clicked")}
      />
    </div>
  );
}
