use wasm_bindgen::prelude::*;
use nalgebra::{vector, Matrix2, Vector2};

const K: f64 = 0.5;
const VX1: Vector2<f64> = vector![0.0, 1.0];
const VY1: Vector2<f64> = vector![1.0, 1.0];

fn into_coord(x : f64, y : f64) -> (f64, f64) {
    ((K * x).tanh(), (K * y).tanh())
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct CurveData {
    neg_points: Vec<(f64, f64)>,
    pos_points: Vec<(f64, f64)>,
    t_neg: Vec<f64>,
    t_pos: Vec<f64>,
}

#[wasm_bindgen]
impl CurveData {
    pub fn new() -> Self {
        let t_neg = (0..500).map(|i| -5.0 + (-0.1 + 5.0) * i as f64 / 499.0).collect();
        let t_pos = (0..500).map(|i| 0.1 + (5.0 - 0.1) * i as f64 / 499.0).collect();
        
        Self {
            neg_points: Vec::new(),
            pos_points: Vec::new(),
            t_neg,
            t_pos,
        }
    }

    // in py it is segments_by
    pub fn compute(&mut self, a: f64) {
        let m = |t: f64, a: f64| -> Matrix2<f64> {
            Matrix2::new(
                t,          a * (t - 1.0/t),
                0.0,        1.0/t
            )
        };

        // in py it was xy(a, t)
        let compute_point = |t: f64, a: f64| -> (f64, f64) {
            let mat = m(t, a);
            let vx = mat * VX1;
            let vy = mat * VY1;
            
            (vx[0] / vx[1], vy[0] / vy[1])
        };

        self.neg_points = self.t_neg.iter()
            .map(|&t| {
                let (x, y) = compute_point(t, a);
                into_coord(x, y)
            })
            .collect();

        self.pos_points = self.t_pos.iter()
            .map(|&t| {
                let (x, y) = compute_point(t, a);
                into_coord(x, y)
            })
            .collect();

        let (first_x, first_y) = compute_point(self.t_neg[0], a);
        web_sys::console::log_1(&format!("First point: ({:.2}, {:.2})", first_x, first_y).into());
    }

    pub fn neg_points_ptr(&self) -> *const (f64, f64) {
        self.neg_points.as_ptr()
    }

    pub fn pos_points_ptr(&self) -> *const (f64, f64) {
        self.pos_points.as_ptr()
    }

    pub fn len(&self) -> usize {
        self.t_neg.len()
    }
}