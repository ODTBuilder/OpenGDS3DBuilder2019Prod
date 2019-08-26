/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

/**
 *
 * @author laht
 */
public class DrawRange {

    private int start;
    private double count;

    public DrawRange(int start, double count) {
        this.start = start;
        this.count = count;
    }

    public int getStart() {
        return start;
    }

    public double getCount() {
        return count;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public void setCount(double count) {
        this.count = count;
    }

    @Override
    public String toString() {
        return "DrawRange{" + "start=" + start + ", count=" + count + '}';
    }

}
