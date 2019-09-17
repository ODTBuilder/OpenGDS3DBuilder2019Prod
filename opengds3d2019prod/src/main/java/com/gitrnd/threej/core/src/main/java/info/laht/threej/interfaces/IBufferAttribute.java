/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces;

import java.io.Serializable;
import java.util.List;

/**
 *
 * @author laht
 */
public interface IBufferAttribute extends Serializable {

    public int getCount();

    public List<Number> getArray();

    public IBufferAttribute setX(int index, Number x);

    public IBufferAttribute setY(int index, Number value);

    public IBufferAttribute setZ(int index, Number value);

    public IBufferAttribute setW(int index, Number value);

    public Number getX(int index);

    public Number getY(int index);

    public Number getZ(int index);

    public Number getW(int index);

}
