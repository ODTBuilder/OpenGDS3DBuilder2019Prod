/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

/**
 * https://github.com/mrdoob/three.js/blob/dev/src/core/Clock.js
 *
 * @author laht
 */
public class Clock {

    private boolean autoStart;

    private long startTime, oldTime;
    private double elapsedTime;

    private boolean running;

    public Clock() {
        this(true);
    }

    public Clock(boolean autoStart) {
        this.autoStart = autoStart;

        this.startTime = 0;
        this.oldTime = 0;
        this.elapsedTime = 0;

        this.running = false;

    }

    public void start() {
        this.startTime = System.currentTimeMillis();

        this.oldTime = this.startTime;
        this.elapsedTime = 0;
        this.running = true;
    }

    public void stop() {
        this.getElapsedTime();
        this.running = false;
    }

    public double getElapsedTime() {
        this.getDelta();
        return this.elapsedTime;
    }

    public double getDelta() {
        double diff = 0;

        if (this.autoStart && !this.running) {

            this.start();

        }

        if (this.running) {

            long newTime = System.currentTimeMillis();

            diff = (newTime - this.oldTime) / 1000d;
            this.oldTime = newTime;

            this.elapsedTime += diff;

        }

        return diff;
    }

}
