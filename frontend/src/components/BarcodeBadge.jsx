import "./BarcodeBadge.css";
const BarcodeBadge = ({ assetTag, serialNumber, size = "md" }) => {
  return <div className={`barcode-badge-container barcode-${size}`}>
      <div className="barcode-visual">
        <div className="barcode-bars">
          <span className="b-bar b-1" />
          <span className="b-bar b-2" />
          <span className="b-bar b-1" />
          <span className="b-bar b-3" />
          <span className="b-bar b-1" />
          <span className="b-bar b-2" />
          <span className="b-bar b-4" />
          <span className="b-bar b-1" />
          <span className="b-bar b-3" />
          <span className="b-bar b-2" />
          <span className="b-bar b-1" />
          <span className="b-bar b-4" />
          <span className="b-bar b-2" />
        </div>
      </div>
      <div className="barcode-label">
        <span className="asset-tag-text">{assetTag}</span>
        {serialNumber && <span className="serial-number-text">SN: {serialNumber}</span>}
      </div>
    </div>;
};
export {
  BarcodeBadge
};
