import numpy as np
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.widgets import Slider

plt.ion()  # 开启交互模式

k = 0.5              # 非线性缩放系数
def into_coord(x, y):
    return np.tanh(k * x), np.tanh(k * y)

# ============= 颜色渐变设置（对称版本） =============
def create_segments(x, y):
    points = np.array([x, y]).T.reshape(-1, 1, 2)
    return np.concatenate([points[:-1], points[1:]], axis=1)

colors = [
    (0.0, (0.8, 1.0, 0.8)),   # t=-5 
    (0.4, (0.0, 1.0, 0.0)),   # t=-1 → 纯绿
    (0.5, (0.0, 0.0, 0.0)),   # t=0  → 纯黑
    (0.6, (1.0, 0.0, 0.0)),   # t=1  → 纯红
    (1.0, (1.0, 0.8, 0.8))    # t=5 
]
cmap = LinearSegmentedColormap.from_list("symmetric_gbr", colors, N=256)
norm = plt.Normalize(vmin=-5, vmax=5)  # 固定范围[-5,5]

# ============= 绘制曲线（参数a） =============
# 生成参数t（严格分离正负区间）
t_neg = np.linspace(-5, -0.1, 500)  # 负数范围
t_pos = np.linspace(0.1, 5, 500)    # 正数范围
    
# ============= 数学：曲线参数 =============
vx1 = np.array([0.0, 1.0])
vy1 = np.array([1.0, 1.0])

def M(a):
    return lambda t: np.array([
        [t,          a * (t - t**-1)],
        [0,          t**-1]
    ])
    
def xy(a, t):
    vx = M(a)(t) @ vx1
    vy = M(a)(t) @ vy1
    return (vx[0]/vx[1], vy[0]/vy[1])

def segments_by(a):
    # ============= 生成两条独立曲线 =============
    def generate_curve(t_values):
        x = np.zeros_like(t_values)
        y = np.zeros_like(t_values)
        for i, ti in enumerate(t_values):
            x[i], y[i] = xy(a, ti)
        return into_coord(x, y)
    
    segments_neg = create_segments(*generate_curve(t_neg))
    segments_pos = create_segments(*generate_curve(t_pos))

    return segments_neg, segments_pos

# print(*into_coord(*xy(1, 0.1)))
# print(*into_coord(*xy(1, 1.0)))
# print(*into_coord(*xy(1, 2.0)))

# ============= 绘图 =============
fig, ax = plt.subplots(figsize=(7,6))
plt.subplots_adjust(bottom=0.25)  # 为滑块留出空间

# 坐标轴设置
ax.set_xlim(-1, 1)
ax.set_ylim(-1, 1)
ax.set_xticks([-1, 0, 1])
ax.set_xticklabels(['-∞', '0', '+∞'])
ax.set_yticks([-1, 0, 1])
ax.set_yticklabels(['-∞', '0', '+∞'])
ax.set_xlabel("x (tanh(kx))")
ax.set_ylabel("y (tanh(ky))")
ax.set_title(f"T-curve on P^1 x P^1")

# 参考线（灰色虚线）
ax.plot([-1, 1], [-1, 1], color='gray', linestyle='--', alpha=0.5, zorder=0)
ax.axvline(into_coord(1,0)[0], color='gray', ls='--', alpha=0.5)
ax.axhline(into_coord(0,1)[1], color='gray', ls='--', alpha=0.5)

# ------------- 初始状态 -------------
a = 1
segments_neg, segments_pos = segments_by(a)
# 绘制负区间曲线（绿→黑）
lc_neg = LineCollection(segments_neg, cmap=cmap, norm=norm, linewidth=2)
lc_neg.set_array(t_neg)
ax.add_collection(lc_neg)
# 绘制正区间曲线（黑→红）
lc_pos = LineCollection(segments_pos, cmap=cmap, norm=norm, linewidth=2)
lc_pos.set_array(t_pos)
ax.add_collection(lc_pos)

plt.scatter(*into_coord(*xy(a, 1)), c="red", s=10) # 标记t=1
# 添加colorbar（标注关键点）
cbar = fig.colorbar(lc_pos, ax=ax, label='Parameter t')
cbar.set_ticks([-5, -1, 0, 1, 5])
cbar.set_ticklabels(['-∞', '-1', '0', '1', '+∞'])

# ------------- 更新 -------------
# 添加滑块
ax_slider = plt.axes([0.2, 0.1, 0.6, 0.03])  # 滑块位置 [左, 下, 宽, 高]
slider = Slider(
    ax=ax_slider,
    label='a = ',
    valmin=-5.0,
    valmax=5.0,
    valinit=1,
)
# 定义滑块回调函数
def update(val):
    a = slider.val
    segments_neg, segments_pos = segments_by(a)
    lc_neg.set_segments(segments_neg)
    lc_pos.set_segments(segments_pos)
    fig.canvas.draw_idle()  # 触发重绘

slider.on_changed(update)  # 绑定滑块事件


plt.grid(True, linestyle=':', alpha=0.3)
plt.tight_layout()
plt.ioff()  # 关闭交互模式（可选）
plt.show()