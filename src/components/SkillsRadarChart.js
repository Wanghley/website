import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import "./css/SkillsRadarChart.css";


ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const SkillsRadarChart = ({ skills }) => {
  const categoryScores = {};
  const categoryCounts = {};

  skills.forEach(({ type, score }) => {
    if (typeof score === "number") {
      categoryScores[type] = (categoryScores[type] || 0) + score;
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    }
  });

  const categories = Object.keys(categoryScores);
  const averages = categories.map(
    type => Math.round(categoryScores[type] / categoryCounts[type])
  );

  const data = {
    labels: categories,
    datasets: [
      {
        label: "Average Score by Category",
        data: averages,
        backgroundColor: "rgba(0, 122, 204, 0.3)",
        borderColor: "#005fa3",
        borderWidth: 2,
        pointBackgroundColor: "#007acc",
        pointHoverRadius: 6,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: "#666",
          backdropColor: "transparent"
        },
        grid: {
          color: "#e0e0e0"
        },
        pointLabels: {
          font: {
            size: 14,
            weight: "600"
          },
          color: "#333"
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: "#ffffff",
        borderColor: "#007acc",
        borderWidth: 1,
        titleColor: "#007acc",
        bodyColor: "#333",
        callbacks: {
          label: context => `${context.label}: ${context.raw} / 100`
        }
      }
    }
  };

  return (
    <div className="skills-radar-container">
      <h2 className="skills-radar-title">Skills Radar</h2>
      <p className="skills-radar-subtitle">
        Average proficiency per skill category (based on self-evaluation)
      </p>
      <Radar data={data} options={options} />
    </div>
  );
  
};

export default SkillsRadarChart;
