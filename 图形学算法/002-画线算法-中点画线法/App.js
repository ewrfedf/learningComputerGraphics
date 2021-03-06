import { Stage } from './Stage.js'
import { MidpointLine, Point } from './MidpointLine.js'

class App {
  constructor() {
    let stage = new Stage()
    let mp = new MidpointLine(stage.scene)
    const p0 = new Point(0, 0)
    const p1 = new Point(20, 5)
    mp.addLinePoints(p0, p1)
    stage.run()
  }
}

new App()
