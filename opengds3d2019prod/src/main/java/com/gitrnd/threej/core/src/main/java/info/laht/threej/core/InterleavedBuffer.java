/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 *
 * @author laht
 */
public class InterleavedBuffer {

    public final UUID uuid = UUID.randomUUID();

    public List<Number> array;

    public int stride, count;

    public UpdateRange updateRange;
    public boolean dynamic;

    public int version;

    private Runnable onUploadCallback;

    private InterleavedBuffer() {

    }

    public InterleavedBuffer(List<Number> array, int stride) {
        this.array = array;
        this.stride = stride;

        this.count = array != null ? array.size() / stride : 0;

        this.dynamic = false;
        this.updateRange = new UpdateRange(0, -1);

        this.version = 0;

    }

    public void needsUpdate(boolean flag) {
        if (flag) {
            version++;
        }
    }

    public void setArray(List<Number> array) {
        this.array = array;
        this.count = array != null ? array.size() / stride : 0;
    }

    public InterleavedBuffer setDynamic(boolean flag) {
        this.dynamic = flag;
        return this;
    }

    public InterleavedBuffer copyAt(int index1, BufferAttribute attribute, int index2) {
        throw new UnsupportedOperationException("Not implemented yet!");
//        index1 *= this.stride;
//        index2 *= attribute.stride;
//
//        for (int i = 0, l = this.stride; i < l; i++) {
//
//            this.array.set(index1 + 1, attribute.array.get(index2 + i));
//
//        }
//
//        return this;
    }

    public InterleavedBuffer set(List<Number> value, int offset) {
        for (int i = offset, j = 0; i < array.size(); i++) {
            array.set(i, value.get(j++));
        }

        return this;
    }

    public InterleavedBuffer copy() {
        return new InterleavedBuffer().copy(this);
    }

    public InterleavedBuffer copy(InterleavedBuffer source) {

        this.array = new ArrayList<>(source.array);
        this.count = source.count;
        this.stride = source.stride;
        this.dynamic = source.dynamic;

        return this;

    }

    public InterleavedBuffer onUpload(Runnable callback) {
        this.onUploadCallback = callback;
        return this;
    }

}
