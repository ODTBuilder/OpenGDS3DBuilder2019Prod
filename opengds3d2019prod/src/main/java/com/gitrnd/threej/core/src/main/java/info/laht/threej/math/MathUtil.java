/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

/**
 *
 * @author laht
 */
public final class MathUtil {

    private MathUtil() {

    }

    public static double clamp(double x, double min, double max) {
        return Math.max(min, Math.min(max, x));
    }

    public static double lerp(double x, double y, double t) {
        return (1 - t) * x + t * y;
    }

    public static int euclideanModulo(int n, int m) {
        return ((n % m) + m) % m;
    }

    public static double mapLinear(double x, double fromMin, double fromMax, double toMin, double toMax) {
        return toMin + (x - fromMin) * (toMax - toMin) / (fromMax - fromMin);
    }

    public static int rand(int low, int high) {
        return low + (int) Math.floor(Math.random() * (high - low + 1));
    }

    public static float rand(float low, float high) {
        return low + (float) Math.random() * (high - low);
    }

    public static double rand(double low, double high) {
        return low + Math.random() * (high - low);
    }

    public static boolean isPowerOfTwo(int value) {
        return (value & (value - 1)) == 0 && value != 0;
    }

    public static int nearestPowerOfTwo(int value) {
        return (int) Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
    }

    public static double nearestPowerOfTwo(double value) {
        return Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
    }

    public static int nextPowerOfTwo(int value) {
        value--;
        value |= value >> 1;
        value |= value >> 2;
        value |= value >> 4;
        value |= value >> 8;
        value |= value >> 16;
        value++;

        return value;
    }
}
