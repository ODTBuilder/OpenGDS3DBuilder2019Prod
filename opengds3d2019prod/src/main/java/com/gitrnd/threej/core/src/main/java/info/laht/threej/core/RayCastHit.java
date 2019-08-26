/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import java.io.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class RayCastHit implements Serializable {

    public double distance;
    public Vector3d point;
    public Face3 face;
    public Integer faceIndex;
    public Object3D object;
    public Vector2d uv;
    public Integer index;

}
