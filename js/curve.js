import init, { get_plot_data } from "../pkg/t_curve_pic.js";

const colorscale = [
	[0.0, 'rgb(240, 255, 240)'],  // t = -5 (浅绿)
	[0.4, 'rgb(0, 255, 0)'],      // t = -1 (纯绿)
	[0.5, 'rgb(0, 0, 0)'],        // t = 0 (黑)
	[0.6, 'rgb(255, 0, 0)'],      // t = 1 (纯红)
	[1.0, 'rgb(255, 240, 240)']   // t = 5 (浅红)
];

function updatePlot() {
	let backgroundColor = document.body.style.backgroundColor;
	let color = document.body.style.color;
	let a = parseFloat(slider_a.value);
	let k = parseFloat(slider_k.value);
	let x_0 = parseFloat(slider_x_0.value);
	let y_0 = parseFloat(slider_y_0.value);

	document.getElementById("a-value").textContent = `a = ${a.toFixed(1)}`;
	document.getElementById("k-value").textContent = `k = ${k.toFixed(2)}`;
	document.getElementById("x_0-value").textContent = `x₀ = ${(Math.atanh(x_0) / k).toFixed(3)}`;
	document.getElementById("y_0-value").textContent = `y₀ = ${(Math.atanh(y_0) / k).toFixed(3)}`;

	let plot = {
		data_0 : {
			x: [x_0], y: [y_0],
			mode: "markers",
			marker: {
				size: 6,
				color: backgroundColor,
			},
			showlegend: false,
		},
		data : get_plot_data(a, k, x_0, y_0).map(([x, y, t_values, name]) => ({
			x: x, y: y,
			mode: "markers",
			marker: {
				size: 8,
				color: t_values,  // 颜色基于参数 t
				colorscale: colorscale,  // 自定义颜色映射
				cmin: -5, cmax: 5, // 颜色范围
				colorbar: {
					// title: "Parameter t",
					tickvals: [-5, -1, 0, 1, 5],  // 自定义刻度
					ticktext: ["-∞", "-1", "0", "1", "+∞"]  // 显示的文字
				}
			},
			showlegend: false,
			legendgroup: name
		})),
		legend_pos : {
			x: [null], y: [null],
			mode: "markers",
			marker: { color: "rgb(255,0,0)" },
			name: "Positive t",
			showlegend: true,
			legendgroup: "Positive t"  // 和主 trace 绑定
		},
		legend_neg : {
			x: [null], y: [null],
			mode: "markers",
			marker: { color: "rgb(0,255,0)" },
			name: "Negative t",
			showlegend: true,
			legendgroup: "Negative t"  // 和主 trace 绑定
		},
		layout : {
			paper_bgcolor: backgroundColor,      // 整体背景色
			plot_bgcolor: backgroundColor,       // 绘图区背景色
			font: { color: color },
			margin: { t: 25, r: 100, b: 5, l: 25 },
			legend: {
				x: 0.5, y: -0.1,
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
				scaleanchor: "x"
			},
			shapes: [
				{
					type: "line",
					x0: -1, y0: -1,
					x1: 1, y1: 1,
					line: { color: "gray", width: 1, dash: "dash" }
				}, // 对角线 y = x
				{
					type: "line",
					x0: Math.tanh(k * 1), y0: -1,
					x1: Math.tanh(k * 1), y1: 1,
					line: { color: "gray", width: 1, dash: "dash" }
				}, // 竖直线 x = tanh(k * 1)（转换后）
				{
					type: "line",
					x0: -1, y0: Math.tanh(k * 1),
					x1: 1, y1: Math.tanh(k * 1),
					line: { color: "gray", width: 1, dash: "dash" }
				}, // 水平线 y = tanh(k * 1)（转换后）
			]
		},
	}
	Plotly.newPlot("plot", plot.data.concat([
		plot.legend_neg, plot.legend_pos, plot.data_0
	]), plot.layout, {responsive: true, paper_bgcolor: backgroundColor});
}

function applyTheme(is_dark) {
	document.documentElement.setAttribute('data-mdc-theme', is_dark ? 'dark' : 'light');
	document.body.style.backgroundColor = is_dark ? '#121212' : '#ffffff';
	document.body.style.color = is_dark ? '#eeeeee' : '#000000';
	document.getElementById('themeToggle').innerHTML = `
	  <i class="material-icons">${is_dark ? 'light_mode' : 'dark_mode'}</i>
	`;

	updatePlot();
}

async function run() {
	await init();
	const slider_a = document.getElementById("slider_a");
	const slider_k = document.getElementById("slider_k");
	const slider_x_0 = document.getElementById("slider_x_0");
	const slider_y_0 = document.getElementById("slider_y_0");

	slider_a.addEventListener("input", updatePlot);
	slider_k.addEventListener("input", updatePlot);
	slider_x_0.addEventListener("input", updatePlot);
	slider_y_0.addEventListener("input", updatePlot);

	// 重置按钮的事件处理
    document.getElementById("reset-button").addEventListener("click", function() {
		document.getElementById("slider_a").value = 1;
		document.getElementById("slider_k").value = 0.5;
		document.getElementById("slider_x_0").value = 0.0;
		document.getElementById("slider_y_0").value = 0.4621171573;
		updatePlot();
	});

	// 主题切换
	const prefers_color_scheme = window.matchMedia('(prefers-color-scheme: dark)');
	prefers_color_scheme.addEventListener('change', e => {
		applyTheme(e.matches);
	});
	applyTheme(prefers_color_scheme.matches);
	
	const toggleBtn = document.getElementById('themeToggle');
	toggleBtn.addEventListener('click', () => {
		const is_dark = document.documentElement.getAttribute('data-mdc-theme') === 'light';
		applyTheme(is_dark)
	});

	// 缩放屏幕重绘
	window.addEventListener('resize', () => {
		updatePlot();
	});

	updatePlot();  // 初始绘制
}
run();
