type StatCardProps = {
  title: string;
  value: number | string;
};

function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        width: "250px",
        boxShadow:
          "0px 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3>{title}</h3>
      <h1>{value}</h1>
    </div>
  );
}

export default StatCard;