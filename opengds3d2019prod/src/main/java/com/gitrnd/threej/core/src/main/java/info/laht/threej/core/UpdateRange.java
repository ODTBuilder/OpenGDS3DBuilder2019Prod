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
public class UpdateRange {

    private int offset;
    private int count;

    public UpdateRange(int offset, int count) {
        this.offset = offset;
        this.count = count;
    }

    public int getOffset() {
        return offset;
    }

    public int getCount() {
        return count;
    }

    @Override
    public String toString() {
        return "UpdateRange{" + "offset=" + offset + ", count=" + count + '}';
    }

}
