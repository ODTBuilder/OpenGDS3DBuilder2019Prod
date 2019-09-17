/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gl;

import org.lwjgl.glfw.*;
import org.lwjgl.opengl.*;

import info.laht.threej.cameras.Camera;
import info.laht.threej.core.Constants;
import info.laht.threej.scenes.Scene;
import org.lwjgl.opengl.GL11;
import org.lwjgl.system.MemoryUtil;
import org.slf4j.*;

/**
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Renderer {

    private final Logger LOG = LoggerFactory.getLogger(Renderer.class);

    // The window handle
    private long window;

    public boolean autoClear = true;
    public boolean autoClearColor = true;
    public boolean autoClearDepth = true;
    public boolean autoClearStencil = true;

    // scene graph
    public boolean sortObjects = true;

    // user-defined clipping
//	this.clippingPlanes = [];
    public boolean localClippingEnabled = false;

    // physically based shading
    public double gammaFactor = 2.0;	// for backwards compatibility
    public boolean gammaInput = false;
    public boolean gammaOutput = false;

    // physical lights
    public boolean physicallyCorrectLights = false;

    // tone mapping
    public int toneMapping = Constants.LinearToneMapping;
    public double toneMappingExposure = 1.0;
    public double toneMappingWhitePoint = 1.0;

    // morphs
    public int maxMorphTargets = 8;
    public int maxMorphNormals = 4;

    public Renderer(int width, int height) {
        // Create the window
        window = GLFW.glfwCreateWindow(width, height, "Hello World!", MemoryUtil.NULL, MemoryUtil.NULL);
        if (window == MemoryUtil.NULL) {
            throw new RuntimeException("Failed to create the GLFW window");
        }
// Get the resolution of the primary monitor
        GLFWVidMode vidmode = GLFW.glfwGetVideoMode(GLFW.glfwGetPrimaryMonitor());
        // Center our window
        GLFW.glfwSetWindowPos(
                window,
                (vidmode.width() - width) / 2,
                (vidmode.height() - height) / 2
        );

        // Make the OpenGL context current
        GLFW.glfwMakeContextCurrent(window);
        // Enable v-sync
        GLFW.glfwSwapInterval(1);

        // Make the window visible
        GLFW.glfwShowWindow(window);
    }
    boolean init;

    private void init() {
        GL.createCapabilities();
        GL11.glClearColor(1.0f, 0.0f, 0.0f, 0.0f);
        init = true;
    }

    public void render(Scene scene, Camera camera) {

        if (!init) {
            init();
        }

        GL11.glClear(GL11.GL_COLOR_BUFFER_BIT | GL11.GL_DEPTH_BUFFER_BIT); // clear the framebuffer

        GLFW.glfwSwapBuffers(window); // swap the color buffers

    }

}
