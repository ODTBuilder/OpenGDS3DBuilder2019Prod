/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Constants;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.*;
import org.apache.commons.lang3.tuple.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * https://github.com/mrdoob/three.js/blob/master/src/materials/Material.js
 *
 * @author laht
 */
public class Material implements Serializable {

    private final static Logger LOG = LoggerFactory.getLogger(Material.class);

    private static AtomicInteger materialIdGen = new AtomicInteger();

    public int id = materialIdGen.incrementAndGet();

    private final Map<String, Object> properties = new HashMap<>();

    public UUID uuid = UUID.randomUUID();
    public String name = "";
    public String type = "Material";

    public boolean fog = true;
    public boolean lights = true;

    public int blending = Constants.NormalBlending;
    public int side = Constants.FrontSide;
    public int shading = Constants.SmoothShading; // THREE.FlatShading, THREE.SmoothShading
    public int vertexColors = Constants.NoColors; // THREE.NoColors, THREE.VertexColors, THREE.FaceColors

    public double opacity = 1;
    public boolean transparent = false;

    public int blendSrc = Constants.SrcAlphaFactor;
    public int blendDst = Constants.OneMinusSrcAlphaFactor;
    public int blendEquation = Constants.AddEquation;
    public int blendSrcAlpha = -1;
    public int blendDstAlpha = -1;
    public int blendEquationAlpha = -1;

    public int depthFunc = Constants.LessEqualDepth;
    public boolean depthTest = true;
    public boolean depthWrite = true;

//	this.clippingPlanes = null;
    public boolean clipIntersection = false;
    public boolean clipShadows = false;

    public boolean colorWrite = true;

//	this.precision = null; // override the renderer's default precision for this material
    public boolean polygonOffset = false;
    public int polygonOffsetFactor = 0;
    public int polygonOffsetUnits = 0;

    public int alphaTest = 0;
    public boolean premultipliedAlpha = false;

    public double overdraw = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer

    public boolean visible = true;

    public boolean _needsUpdate = true;

    public void needsUpdate() {
        _needsUpdate = true;
    }

    public Object getProperty(String key) {
        return properties.get(key);
    }

    public void setProperty(String key, Object value) {
        properties.put(key, value);
    }

    protected final void setValues(Pair<String, Object>... values) {
        if (values == null) {
            return;
        }

        for (Pair<String, Object> pair : values) {
            String key = pair.getKey();
            Object newValue = pair.getValue();

            if (newValue == null) {
                LOG.warn("Material: '{}' parameter is undefined", key);
                continue;
            }

            Object currentValue = properties.get(key);
            if (currentValue == null) {
                LOG.warn("{} is not a property of this material", key);
                continue;
            }

            if (currentValue instanceof Color) {
                Color c = (Color) currentValue;
                c.copy((Color) newValue);
            } else if (currentValue instanceof Vector3d) {
                Vector3d v = (Vector3d) currentValue;
                v.copy((Vector3d) newValue);
            } else if (key.equals("overdraw")) {
                setProperty(key, newValue);
            } else {
                setProperty(key, newValue);
            }

        }

    }

    public Material copy() {
        return new Material().copy(this);
    }

    public Material copy(Material source) {
        this.name = source.name;

        this.fog = source.fog;
        this.lights = source.lights;

        this.blending = source.blending;
        this.side = source.side;
        this.shading = source.shading;
        this.vertexColors = source.vertexColors;

        this.opacity = source.opacity;
        this.transparent = source.transparent;

        this.blendSrc = source.blendSrc;
        this.blendDst = source.blendDst;
        this.blendEquation = source.blendEquation;
        this.blendSrcAlpha = source.blendSrcAlpha;
        this.blendDstAlpha = source.blendDstAlpha;
        this.blendEquationAlpha = source.blendEquationAlpha;

        this.depthFunc = source.depthFunc;
        this.depthTest = source.depthTest;
        this.depthWrite = source.depthWrite;

        this.colorWrite = source.colorWrite;

        this.polygonOffset = source.polygonOffset;
        this.polygonOffsetFactor = source.polygonOffsetFactor;
        this.polygonOffsetUnits = source.polygonOffsetUnits;

        this.alphaTest = source.alphaTest;

        this.premultipliedAlpha = source.premultipliedAlpha;

        this.overdraw = source.overdraw;

        this.visible = source.visible;
        this.clipShadows = source.clipShadows;
        this.clipIntersection = source.clipIntersection;

        return this;
    }

}
