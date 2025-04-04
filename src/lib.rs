use wasm_bindgen::prelude::*;
use nalgebra::{Matrix2, Vector2, vector};

struct Config {
    a: f64,
    k: f64,
    vx1: Vector2<f64>,
    vy1: Vector2<f64>,
}
impl Config {
    pub fn from_f64(a : f64, k : f64, x0 : f64, y0 : f64) -> Self {
        let Point(vx, vy) = Point::from_coord(k, x0, y0);
        Config {
            a,
            k,
            vx1 : vector![vx, 1.0],
            vy1 : vector![vy, 1.0],
        }
    }
}

struct Point(f64, f64);
impl Point {
    fn into_coord(self, k : f64) -> (f64, f64) {
        ((k * self.0).tanh(), (k * self.1).tanh())
    }

    fn from_coord(k : f64, x0 : f64, y0 : f64) -> Self {
        Self(k.recip() * (x0).atanh(), k.recip() * (y0).atanh())
    }
}

#[allow(non_snake_case)]
fn M(a : f64, t: f64) -> Matrix2<f64> {
    Matrix2::new(
        t,   a * (t - t.recip()),
        0.0, t.recip()
    )
}

fn xy(config : &Config, t: f64) -> Point {
    let vx = M(config.a, t) * config.vx1;
    let vy = M(config.a, t) * config.vy1;
    Point(vx[0]/vx[1], vy[0]/vy[1])
}

fn compute_curve(config : &Config, t_values: impl Iterator<Item = f64>) -> (Vec<f64>, Vec<f64>) {
    let mut x_values = Vec::new();
    let mut y_values = Vec::new();

    for t in t_values {
        let (x, y) = xy(config, t).into_coord(config.k);
        x_values.push(x);
        y_values.push(y);
    }

    (x_values, y_values)
}

#[wasm_bindgen]
pub fn get_plot_data(a : f64, k : f64, x0 : f64, y0 : f64) -> JsValue {
    let config = Config::from_f64(a, k, x0, y0);

    let t_neg : Vec<f64> = (-500..-1).map(|i| i as f64 / 100.0).collect();
    let t_pos : Vec<f64>= (1..500).map(|i| i as f64 / 100.0).collect();

    let (x_neg, y_neg) = compute_curve(&config, t_neg.iter().map(|&e| e));
    let (x_pos, y_pos) = compute_curve(&config, t_pos.iter().map(|&e| e));

    let data = serde_wasm_bindgen::to_value(&vec![
        (x_neg, y_neg, t_neg, "Negative t"),
        (x_pos, y_pos, t_pos, "Positive t"),
    ]).unwrap();

    data
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_curve() {
        let config = Config::from_f64(1.0, 0.5, 0.0, 1.0);
        let t_values = vec![0.1, 1.0, 2.0];
        let (x_values, y_values) = compute_curve(&config, t_values.into_iter());
        
        // 测试特定点的计算结果
        assert!((x_values[0] - (-0.458175844698613)).abs() < 0.01);
        assert!((y_values[0] - (-0.4542164326822591)).abs() < 0.01);
        
        assert!((x_values[1] - (0.0)).abs() < 0.01);
        assert!((y_values[1] - (0.46211715726000974)).abs() < 0.01);
        
        assert!((x_values[2] - (0.9051482536448665)).abs() < 0.01);
        assert!((y_values[2] - (0.9981778976111987)).abs() < 0.01);
        
        // 测试红绿线是否重合
        let config = Config::from_f64(1.3, 0.5, 0.0, 1.0);

        for t in (1..500).map(|i| i as f64 / 100.0) {
            let (px, py) = xy(&config, t).into_coord(0.5);
            let (nx, ny) = xy(&config, -t).into_coord(0.5);
            assert!((px - nx).abs() > 0.01);
            assert!((py - ny).abs() < 0.01);
        }
    }

}