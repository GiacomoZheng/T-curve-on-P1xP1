import init, { get_plot_data } from "../pkg/pgpt.js";

async function run() {
	await init();
	const slider_a = document.getElementById("slider_a");
	const slider_k = document.getElementById("slider_k");
	const slider_x_0 = document.getElementById("slider_x_0");
	const slider_y_0 = document.getElementById("slider_y_0");

	function updatePlot() {
		let a = parseFloat(slider_a.value);
		let k = parseFloat(slider_k.value);
		let x_0 = parseFloat(slider_x_0.value);
		let y_0 = parseFloat(slider_y_0.value);

		document.getElementById("a-value").textContent = `a = ${a.toFixed(1)}`;
		document.getElementById("k-value").textContent = `k = ${k.toFixed(2)}`;
		document.getElementById("x_0-value").textContent = `x_0 = ${(Math.atanh(x_0) / k).toFixed(3)}`;
		document.getElementById("y_0-value").textContent = `y_0 = ${(Math.atanh(y_0) / k).toFixed(3)}`;

		let data = get_plot_data(a, k, x_0, y_0);
		let traces = data.map(([x, y, color, name]) => ({
			x: x,
			y: y,
			mode: "lines",
			line: { color: color },
			name: name
		}));
		let layout = {
			title: "T-curve on P¹ × P¹",
			xaxis: {
				range: [-1, 1],
				title: "x (tanh(kx))",
				tickvals: [-1, 0, 1],  // 设定刻度值
				ticktext: ["-∞", "0", "+∞"],  // 设定刻度文本
			},
			yaxis: {
				range: [-1, 1],
				title: "y (tanh(ky))",
				tickvals: [-1, 0, 1],
				ticktext: ["-∞", "0", "+∞"],
			},
			shapes: [
				{
					type: 'circle',
					xref: 'x',
					yref: 'y',
					x0: x_0 - 0.02,
					y0: y_0 - 0.02,
					x1: x_0 + 0.02,
					y1: y_0 + 0.02,
					opacity: 1,
					fillcolor: 'red',
					line: {
						color: 'red'
					}
				},
				// 对角线 y = x
				{
					type: "line",
					x0: -1, y0: -1,
					x1: 1, y1: 1,
					line: { color: "gray", width: 1, dash: "dash" }
				},
				// 竖直线 x = tanh(k * 1)（转换后）
				{
					type: "line",
					x0: Math.tanh(k * 1), y0: -1,
					x1: Math.tanh(k * 1), y1: 1,
					line: { color: "gray", width: 1, dash: "dash" }
				},
				// 水平线 y = tanh(k * 1)（转换后）
				{
					type: "line",
					x0: -1, y0: Math.tanh(k * 1),
					x1: 1, y1: Math.tanh(k * 1),
					line: { color: "gray", width: 1, dash: "dash" }
				}
			]
		};

		Plotly.newPlot("plot", traces, layout);
	}

	slider_a.addEventListener("input", updatePlot);
	slider_k.addEventListener("input", updatePlot);
	slider_x_0.addEventListener("input", updatePlot);
	slider_y_0.addEventListener("input", updatePlot);
	updatePlot();  // 初始绘制
}
run();