/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import java.io.Serializable;

/**
 *
 * @author laht
 */
public class GeometryGroup implements Serializable {

    public int start;
    public int count;
    public Integer materialIndex;

    public GeometryGroup() {
        this(-1, -1, null);
    }

    public GeometryGroup(int start, int count) {
        this(start, count, null);
    }

    public GeometryGroup(int start, int count, Integer materialIndex) {
        this.start = start;
        this.count = count;
        this.materialIndex = materialIndex;
    }

}
