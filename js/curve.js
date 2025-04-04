import init, { get_plot_data } from "../pkg/t_curve_pic.js";

async function run() {
	await init();
	const slider_a = document.getElementById("slider_a");
	const slider_k = document.getElementById("slider_k");
	const slider_x_0 = document.getElementById("slider_x_0");
	const slider_y_0 = document.getElementById("slider_y_0");

	const colorscale = [
		[0.0, 'rgb(240, 255, 240)'],  // t = -5 (浅绿)
		[0.4, 'rgb(0, 255, 0)'],      // t = -1 (纯绿)
		[0.5, 'rgb(0, 0, 0)'],        // t = 0 (黑)
		[0.6, 'rgb(255, 0, 0)'],      // t = 1 (纯红)
		[1.0, 'rgb(255, 240, 240)']   // t = 5 (浅红)
	];

	function updatePlot() {
		let a = parseFloat(slider_a.value);
		let k = parseFloat(slider_k.value);
		let x_0 = parseFloat(slider_x_0.value);
		let y_0 = parseFloat(slider_y_0.value);

		document.getElementById("a-value").textContent = `a = ${a.toFixed(1)}`;
		document.getElementById("k-value").textContent = `k = ${k.toFixed(2)}`;
		document.getElementById("x_0-value").textContent = `x_0 = ${(Math.atanh(x_0) / k).toFixed(3)}`;
		document.getElementById("y_0-value").textContent = `y_0 = ${(Math.atanh(y_0) / k).toFixed(3)}`;

		let plot = {
			data : get_plot_data(a, k, x_0, y_0).map(([x, y, t_values, name]) => ({
				name: name,
				x: x,
				y: y,
				mode: "markers",
				marker: {
					size: 8,
					color: t_values,  // 颜色基于参数 t
					colorscale: colorscale,  // 自定义颜色映射
					cmin: -5, cmax: 5, // 颜色范围
					colorbar: {
						title: "Parameter t",
						tickvals: [-5, -1, 0, 1, 5],  // 自定义刻度
						ticktext: ["-∞", "-1", "0", "1", "+∞"]  // 显示的文字
					}
				}
			})),
			layout : {
				title: {
					text: "T-curve on ℙ¹ × ℙ¹",
					font: {
					  size: 20
					},
					xref: "paper",
					x: 0.5,  // 居中（0 = 左，1 = 右）
					xanchor: "center"
				},
				legend: {
					x: 0.5,
					y: -0.1,
					xanchor: "center",
					orientation: "h"  // 水平布局
				},
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
						x0: x_0 - 0.01,
						y0: y_0 - 0.01,
						x1: x_0 + 0.01,
						y1: y_0 + 0.01,
						opacity: 1,
						fillcolor: 'white',
						line: {
							color: 'white'
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
			},
		}
		Plotly.newPlot("plot", plot.data, plot.layout);
	}

	slider_a.addEventListener("input", updatePlot);
	slider_k.addEventListener("input", updatePlot);
	slider_x_0.addEventListener("input", updatePlot);
	slider_y_0.addEventListener("input", updatePlot);
	updatePlot();  // 初始绘制
}
run();