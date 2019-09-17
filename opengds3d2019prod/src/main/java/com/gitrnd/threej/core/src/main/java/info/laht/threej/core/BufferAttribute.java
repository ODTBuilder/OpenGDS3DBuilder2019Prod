/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IBufferAttribute;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix4d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector4d;
import java.util.*;

/**
 *
 * @author laht
 */
public class BufferAttribute implements IBufferAttribute {

    private UUID uuid;

    private UpdateRange updateRange;

    private int version;
    int itemSize, count;

    public List<Number> array;

    private boolean normalized;
    private boolean dynamic;

    private Runnable onUploadCallback;

    private BufferAttribute() {
        //copy only
    }

    protected BufferAttribute(List<Number> array, int itemSize) {
        this(array, itemSize, false);
    }

    protected BufferAttribute(List<Number> array, int itemSize, boolean normalized) {
        this.uuid = UUID.randomUUID();

        this.array = array;
        this.itemSize = itemSize;
        this.count = (array != null) ? array.size() / itemSize : 0;
        this.normalized = normalized;

        this.dynamic = false;
        this.updateRange = new UpdateRange(0, -1);

        this.version = 0;

    }

    public List<Number> getArray() {
        return array;
    }

    public int getCount() {
        return count;
    }

    public void needsUpdate(boolean flag) {
        if (flag) {
            version++;
        }
    }

    public void setArray(List<Number> array) {
        this.count = (array != null) ? array.size() / itemSize : 0;
        this.array = array;
    }

    public BufferAttribute setDynamic(boolean flag) {
        this.dynamic = flag;
        return this;
    }

    public BufferAttribute copyAt(int index1, BufferAttribute attribute, int index2) {

        index1 *= itemSize;
        index2 *= attribute.itemSize;

        for (int i = 0; i < itemSize; i++) {
            array.set(index1 + 1, attribute.array.get(index2 + 1));
        }

        return this;

    }

    public BufferAttribute copyArray(List<Number> array) {
        this.array.clear();
        this.array.addAll(array);
        return this;
    }

    public BufferAttribute copyColorsArray(List<Color> colors) {

        array.clear();
        for (int i = 0, l = colors.size(); i < l; i++) {
            Color color = colors.get(i);

            array.add(color.r);
            array.add(color.g);
            array.add(color.b);

        }

        return this;

    }

    public BufferAttribute copyIndicesArray(List<Face3> indices) {

        array.clear();
        for (int i = 0, l = indices.size(); i < l; i++) {
            Face3 index = indices.get(i);

            array.add(index.a);
            array.add(index.b);
            array.add(index.c);

        }

        return this;

    }

    public BufferAttribute copyVector2sArray(List<Vector2d> indices) {

        array.clear();
        for (int i = 0, l = indices.size(); i < l; i++) {
            Vector2d vector = indices.get(i);

            array.add(vector.x());
            array.add(vector.y());

        }

        return this;

    }

    public BufferAttribute copyVector3sArray(List<Vector3d> indices) {

        array.clear();
        for (int i = 0, l = indices.size(); i < l; i++) {
            Vector3d vector = indices.get(i);

            array.add(vector.x());
            array.add(vector.y());
            array.add(vector.z());

        }

        return this;

    }

    public BufferAttribute copyVector4sArray(List<Vector4d> indices) {

        array.clear();
        for (int i = 0, l = indices.size(); i < l; i++) {
            Vector4d vector = indices.get(i);

            array.add(vector.x());
            array.add(vector.y());
            array.add(vector.z());
            array.add(vector.w());

        }

        return this;

    }

    public BufferAttribute set(List<Number> value, int offset) {
        for (int i = offset, j = 0; i < array.size(); i++) {
            array.set(i, value.get(j++));
        }

        return this;
    }

    public Number getX(int index) {
        return array.get(index * itemSize);
    }

    public BufferAttribute setX(int index, Number value) {
        array.set(index * itemSize, value);
        return this;
    }

    public Number getY(int index) {
        return array.get(index * itemSize + 1);
    }

    public BufferAttribute setY(int index, Number value) {
        array.set(index * itemSize + 1, value);
        return this;
    }

    public Number getZ(int index) {
        return array.get(index * itemSize + 2);
    }

    public BufferAttribute setZ(int index, Number value) {
        array.set(index * itemSize + 2, value);
        return this;
    }

    public Number getW(int index) {
        return array.get(index * itemSize + 3);
    }

    public BufferAttribute setW(int index, Number value) {
        array.set(index * itemSize + 3, value);
        return this;
    }

    public BufferAttribute setXY(int index, Number x, Number y) {
        index *= itemSize;

        array.set(index + 0, x);
        array.set(index + 1, y);

        return this;
    }

    public BufferAttribute setXYZ(int index, Number x, Number y, Number z) {
        index *= itemSize;

        array.set(index + 0, x);
        array.set(index + 1, y);
        array.set(index + 2, z);

        return this;
    }

    public BufferAttribute setXYZW(int index, Number x, Number y, Number z, Number w) {
        index *= itemSize;

        array.set(index + 0, x);
        array.set(index + 1, y);
        array.set(index + 2, z);
        array.set(index + 3, w);

        return this;
    }

    public BufferAttribute applyToBufferAttribute(Matrix3d matrix) {

        Vector3d v1 = new Vector3d();

        for (int i = 0; i < count; i++) {
            v1.x(getX(i).doubleValue());
            v1.y(getY(i).doubleValue());
            v1.z(getZ(i).doubleValue());

            v1.applyMatrix3(matrix);

            setXYZ(i, v1.x(), v1.y(), v1.z());
        }

        return this;

    }

    public BufferAttribute applyToBufferAttribute(Matrix4d matrix) {

        Vector3d v1 = new Vector3d();

        for (int i = 0; i < count; i++) {
            v1.x(getX(i).doubleValue());
            v1.y(getY(i).doubleValue());
            v1.z(getZ(i).doubleValue());

            v1.applyMatrix4(matrix);

            setXYZ(i, v1.x(), v1.y(), v1.z());
        }

        return this;

    }

    public BufferAttribute copy() {
        return new BufferAttribute().copy(this);
    }

    public BufferAttribute copy(BufferAttribute source) {

        this.array = new ArrayList(source.array);
        this.itemSize = source.itemSize;
        this.count = source.count;
        this.normalized = source.normalized;

        this.dynamic = source.dynamic;

        return this;
    }

    public BufferAttribute onUpload(Runnable callback) {
        this.onUploadCallback = callback;
        return this;
    }

    public static class IntBufferAttribute extends BufferAttribute {

        public IntBufferAttribute(int[] array, int itemSize) {
            this(array, itemSize, false);
        }

        public IntBufferAttribute(int[] array, int itemSize, boolean normalized) {
            super(convert(array), itemSize, normalized);
        }

    }

    public static class FloatBufferAttribute extends BufferAttribute {

        public FloatBufferAttribute(float[] array, int itemSize) {
            this(array, itemSize, false);
        }

        public FloatBufferAttribute(float[] array, int itemSize, boolean normalized) {
            super(convert(array), itemSize, normalized);
        }

    }

    public static class DoubleBufferAttribute extends BufferAttribute {

        public DoubleBufferAttribute(double[] array, int itemSize) {
            this(array, itemSize, false);
        }

        public DoubleBufferAttribute(double[] array, int itemSize, boolean normalized) {
            super(convert(array), itemSize, normalized);
        }

    }

    private static List<Number> convert(int[] array) {
        List<Number> list = new ArrayList<>(array.length);
        for (int d : array) {
            list.add(d);
        }
        return list;
    }

    private static List<Number> convert(float[] array) {
        List<Number> list = new ArrayList<>(array.length);
        for (float d : array) {
            list.add(d);
        }
        return list;
    }

    private static List<Number> convert(double[] array) {
        List<Number> list = new ArrayList<>(array.length);
        for (double d : array) {
            list.add(d);
        }
        return list;
    }

}
