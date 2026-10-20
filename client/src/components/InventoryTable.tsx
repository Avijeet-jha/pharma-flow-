function InventoryTable() {
  const medicines = [
    {
      name: "Paracetamol",
      stock: 120,
    },
    {
      name: "Crocin",
      stock: 12,
    },
    {
      name: "Vitamin C",
      stock: 55,
    },
    {
      name: "Dolo 650",
      stock: 5,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        marginTop: "30px",
      }}
    >
      <h2>Inventory Overview</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {medicines.map((medicine, index) => {
            const status =
              medicine.stock <= 20
                ? "Low Stock"
                : "Healthy";

            return (
              <tr key={index}>
                <td>{medicine.name}</td>

                <td>{medicine.stock}</td>

                <td
                  style={{
                    color:
                      status === "Low Stock"
                        ? "red"
                        : "green",
                    fontWeight: "bold",
                  }}
                >
                  {status}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;