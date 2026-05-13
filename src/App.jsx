import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [vms, setVms] = useState([]);
  const [cpuHistory, setCpuHistory] = useState([]);

  const API_URL =
    "https://monitoring-backend-12345-g8e0aqaudmg9c6hq.southeastasia-01.azurewebsites.net/api/vms";

  // 🔄 Fetch backend data
  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      setVms(data);

      // 📊 Calculate average CPU safely
      const avgCpu = data.length
        ? data.reduce((sum, vm) => sum + Number(vm.cpu), 0) / data.length
        : 0;

      setCpuHistory((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString().slice(0, 5),
          cpu: Math.round(avgCpu),
        };

        return [...prev, newPoint].slice(-10);
      });
    } catch (err) {
      console.log("API Error:", err);
    }
  };

  // ⏱ Auto refresh every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>☁️ Cloud Monitoring Dashboard</h1>

      {/* VM CARDS */}
      <div style={styles.grid}>
        {vms.map((vm, index) => (
          <div key={index} style={styles.card}>
            <h2 style={styles.vmName}>{vm.name}</h2>

            {/* CPU */}
            <p>🖥 CPU: {vm.cpu}%</p>
            <div style={styles.bar}>
              <div
                style={{
                  ...styles.fill,
                  width: `${vm.cpu}%`,
                  background: vm.cpu > 80 ? "#ef4444" : "#38bdf8",
                }}
              />
            </div>

            {/* RAM */}
            <p style={{ marginTop: 10 }}>💾 RAM: {vm.ram}%</p>
            <div style={styles.bar}>
              <div
                style={{
                  ...styles.fill,
                  width: `${vm.ram}%`,
                  background: vm.ram > 80 ? "#ef4444" : "#8b5cf6",
                }}
              />
            </div>

            {/* STATUS */}
            <p style={{ marginTop: 10 }}>
              Status:{" "}
              <span
                style={{
                  color: vm.status === "Running" ? "limegreen" : "orange",
                  fontWeight: "bold",
                }}
              >
                {vm.status}
              </span>
            </p>

            {/* ALERT */}
            {vm.cpu > 80 && (
              <p style={styles.alert}>⚠ High CPU Alert!</p>
            )}
          </div>
        ))}
      </div>

      {/* CHART */}
      <div style={styles.chartBox}>
        <h2>📊 CPU Usage Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cpuHistory}>
            <XAxis dataKey="time" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#38bdf8"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #0f172a, #1e293b)",
    color: "white",
    padding: "30px",
    fontFamily: "Arial",
  },

  title: {
    textAlign: "center",
    fontSize: "36px",
    color: "#38bdf8",
    marginBottom: "30px",
  },

  grid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "16px",
    width: "280px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
  },

  vmName: {
    color: "#38bdf8",
    marginBottom: "15px",
  },

  bar: {
    width: "100%",
    height: "10px",
    background: "#334155",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "5px",
  },

  fill: {
    height: "100%",
    borderRadius: "10px",
  },

  alert: {
    marginTop: "10px",
    color: "#ef4444",
    fontWeight: "bold",
  },

  chartBox: {
    marginTop: "40px",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "16px",
  },
};