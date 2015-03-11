pc.script.attribute('maps', 'asset', [], {
    displayName: 'Height Map',
    type: 'texture'
});

pc.script.create('bgshader', function (context) {
    // Creates a new Bgshader instance
    var Bgshader = function (entity) {
        this.entity = entity;

        this.time = 0;
        this.heightMap = null;
        this.shader = null;
    };

    Bgshader.prototype = {
        initialize: function () {
            var model = this.entity.model.model;
            var gd = context.graphicsDevice;
        
            // Save the diffuse map from the original material before we replace it.
            this.diffuseTexture = model.meshInstances[0].material.diffuseMap;

            // A shader definition used to create a new shader.
            var shaderDefinition = {
                attributes: {
                    aPosition: pc.gfx.SEMANTIC_POSITION,
                    aUv0: pc.gfx.SEMANTIC_TEXCOORD0
                },
                vshader: [
                    "attribute vec3 aPosition;",
                    "attribute vec2 aUv0;",
                    "",
                    "uniform mat4 matrix_model;",
                    "uniform mat4 matrix_viewProjection;",
                    "",
                    "varying vec2 vUv0;",
                    "",
                    "void main(void)",
                    "{",
                    "    vUv0 = aUv0;",
                    "    gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition, 1.0);",
                    "}"
                ].join("\n"),
                fshader: [
                    // Created by inigo quilez - iq/2013 : https://www.shadertoy.com/view/4dl3zn
                    // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
                    // Messed up by Weyland
                    "precision " + gd.precision + " float;",
                    "",
                    "varying vec2 vUv0;",
                    "",
                    "uniform sampler2D uDiffuseMap;",
                    "uniform float time;",
                    "vec2 resolution = vec2(1280.0, 720.0);",
                    "#define PI 3.14159265",
                    "void rotate2D (inout vec2 vertex, float rads)",
                    "{",
                    "  mat2 tmat = mat2(cos(rads), -sin(rads),",
                    "                   sin(rads), cos(rads));",
                    "  vertex.xy = vertex.xy * tmat;",
                    "}",
                    "",
                    "void main( void ) {",
                    "    vec2 p = ( gl_FragCoord.xy / resolution.xy ) - 0.5;",
                    "	p.y -= 0.15;",
                    ""	,
                    "	p.x /= resolution.y/resolution.x * ((80.0 * sin(0.1)), 64.0 * cos(1.0));",
                    ""	,
                    "	rotate2D(p, (55.0*PI/6.) );",
                    ""	,
                    "	float x = p.x;",
                    ""	,
                    "	float t = atan(p.y,p.x);",
                    ""	,
                    "	float h = t / (6.0* PI) * 2.5 * (time + 250.0);",
                    ""	,
                    "	rotate2D(p, floor(2.0+h)*(-2.0*PI/8.0) *time*0.008);",
                    ""	,
                    "	float dy = 1./ ( 10. * abs(length(p.y) + 0.15));",
                    ""	,
                    "	gl_FragColor = vec4( (x + 0.2) * dy, 0.5 * dy, 0.4 * dy, 1.0 );",
                    "}"
                    
                ].join("\n")
            };
            
            // Create the shader from the definition
            this.shader = new pc.gfx.Shader(gd, shaderDefinition);
                
            // Create a new material and set the shader
            this.material = new pc.scene.Material();
            this.material.setShader(this.shader);
            
            // Set the initial parameters
            this.material.setParameter('time', 0);
            this.material.setParameter('uDiffuseMap', this.diffuseTexture);
            
            // Replace the material on the model with our new material
            model.meshInstances[0].material = this.material;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            this.time += dt;
            
            // Update the time value in the material
            this.material.setParameter('time', this.time);
        }
    };

    return Bgshader;
});