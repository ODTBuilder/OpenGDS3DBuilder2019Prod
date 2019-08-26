/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IBufferAttribute;
import java.util.List;
import java.util.UUID;

/**
 *
 * @author laht
 */
public class InterleavedBufferAttribute implements IBufferAttribute {

    public final UUID uuid = UUID.randomUUID();

    public InterleavedBuffer data;
    public int itemSize;
    public int offset;

    public final boolean normalized;

    public InterleavedBufferAttribute(InterleavedBuffer interleavedBuffer, int itemSize, int offset) {
        this(interleavedBuffer, itemSize, offset, false);
    }

    public InterleavedBufferAttribute(InterleavedBuffer interleavedBuffer, int itemSize, int offset, boolean normalized) {

        this.data = interleavedBuffer;
        this.itemSize = itemSize;
        this.offset = offset;
        this.normalized = normalized;

    }

    public int getCount() {
        return data.count;
    }

    public List<Number> getArray() {
        return data.array;
    }

    public InterleavedBufferAttribute setX(int index, Number x) {
        data.array.set(index * data.stride + offset, x);
        return this;
    }

    public InterleavedBufferAttribute setY(int index, Number value) {
        data.array.set(index * data.stride + offset + 1, value);
        return this;
    }

    public InterleavedBufferAttribute setZ(int index, Number value) {
        data.array.set(index * data.stride + offset + 2, value);
        return this;
    }

    public InterleavedBufferAttribute setW(int index, Number value) {
        data.array.set(index * data.stride + offset + 3, value);
        return this;
    }

    public Number getX(int index) {
        return data.array.get(index * data.stride + offset);
    }

    public Number getY(int index) {
        return data.array.get(index * data.stride + offset + 1);
    }

    public Number getZ(int index) {
        return data.array.get(index * data.stride + offset + 2);
    }

    public Number getW(int index) {
        return data.array.get(index * data.stride + offset + 3);
    }

    public InterleavedBufferAttribute setXY(int index, Number x, Number y) {
        throw new UnsupportedOperationException("Not implemented yet!");
    }

    public InterleavedBufferAttribute setXYZ(int index, Number x, Number y, Number z) {
        throw new UnsupportedOperationException("Not implemented yet!");
    }

    public InterleavedBufferAttribute setXYZW(int index, Number x, Number y, Number z, Number w) {
        throw new UnsupportedOperationException("Not implemented yet!");
    }

}
