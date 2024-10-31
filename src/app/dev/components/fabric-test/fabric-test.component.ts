import {Component, OnInit} from '@angular/core';
import Konva from "konva";


@Component({
    selector: 'app-fabric-test',
    templateUrl: './fabric-test.component.html',
    styleUrl: './fabric-test.component.scss'
})
export class FabricTestComponent implements OnInit {

    stage: any;

    ngOnInit(): void {
        this.stage = new Konva.Stage({
            container: 'container',
            width: 1000,
            height: 500,
            id: "container id",
            draggable: false,
        })
        let layer = new Konva.Layer({
            draggable: false
        });

        let circle = new Konva.Circle({
            x: this.stage.width() / 2,
            y: this.stage.height() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            id: "hello",
            draggable: true
        });


        circle.on('click', (e) => {
            console.log(e.target.attrs["id"])
            console.log(layer.findOne('#bugngu'))

        })

        Konva.Image.fromURL("../assets/ladybug.png", function (darthNode) {
            darthNode.setAttrs({
                x: 200,
                y: 50,
                scaleX: 0.5,
                scaleY: 0.5,
                cornerRadius: 20,
                draggable: true,
                id: "bugimage",
                imgUrl: "../assets/ladybug.png"
            });
            layer.add(darthNode);
            darthNode.on("click", e => {
                console.log(e.target.attrs["id"])
            })

            let tr = new Konva.Transformer({
                node: darthNode,
                rotateEnabled: true
            });
            layer.add(tr);
        });

        let rect1 = new Konva.Rect({
            x: 20,
            y: 20,
            width: 100,
            height: 50,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });
        layer.add(rect1);
        let tr = new Konva.Transformer({
            node: rect1,
            rotateEnabled: true
        });
        layer.add(tr);




        layer.add(circle);
        this.stage.add(layer);
        layer.draw();
    }

    toJson() {
        let json = this.stage.toJSON();

        let stage2 = new Konva.Stage({
            container: 'container2',
            width: 1000,
            height: 500,
            id: "container id",
            draggable: false,
        })

        stage2 = Konva.Node.create(json, 'container2')
        console.log(this.stage.findOne("#bugimage"))

        let img = new Image();
        img.onload = function () {
            stage2.findOne("#bugimage")?.setAttr("image", img);
        }
        img.src = stage2.findOne("#bugimage")?.getAttr("imgUrl");


    }
}
