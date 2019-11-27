/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.io.*;
import java.util.*;

/**
 * 
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Face3 implements Serializable {

	public int a, b, c;

	public Vector3d normal;

	public final List<Vector3d> vertexNormals;

	public Color color;
	public final List<Color> vertexColors;

	public Integer materialIndex;

	public int _id = -1;

	private Face3() {
		this.vertexNormals = new ArrayList<>();
		this.vertexColors = new ArrayList<>();
	}

	public Face3(int a, int b, int c, Object normal) {
		this(a, b, c, normal, null, 0);
	}

	public Face3(int a, int b, int c, Object normal, Object color, Integer materialIndex) {
		this.a = a;
		this.b = b;
		this.c = c;

		this.normal = ((normal != null) && (normal instanceof Vector3d)) ? (Vector3d) normal : new Vector3d();
		this.vertexNormals = (normal instanceof List) ? (List<Vector3d>) normal : new ArrayList<>();

		this.color = (color instanceof Color) ? this.color : new Color();
		this.vertexColors = (color instanceof List) ? (List<Color>) color : new ArrayList<>();

		this.materialIndex = materialIndex;

	}

	public Face3 copy() {
		return new Face3().copy(this);
	}

	public Face3 copy(Face3 source) {

		this.a = source.a;
		this.b = source.b;
		this.c = source.c;

		this.normal.copy(source.normal);
		this.color.copy(source.color);

		this.materialIndex = source.materialIndex;

		this.vertexNormals.clear();
		for (int i = 0; i < source.vertexNormals.size(); i++) {
			this.vertexNormals.add(source.vertexNormals.get(i).copy());
		}

		this.vertexColors.clear();
		for (int i = 0; i < source.vertexColors.size(); i++) {
			this.vertexColors.add(source.vertexColors.get(i).copy());
		}

		return this;
	}

}
