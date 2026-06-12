const COINS = [5, 10, 20, 50, 100] as const;

interface CoinSelectorProps {
  onSelect: (coin: number) => void;
  disabled?: boolean;
}

export default function CoinSelector({ onSelect, disabled }: CoinSelectorProps) {
  return (
    <div className="coin-selector">
      {COINS.map((coin) => (
        <button
          key={coin}
          className="coin-btn"
          onClick={() => onSelect(coin)}
          disabled={disabled}
          type="button"
          aria-label={`Insert ${coin} cent coin`}
        >
          <span className="coin-value">{coin}</span>
          <span className="coin-unit">¢</span>
        </button>
      ))}
    </div>
  );
}
