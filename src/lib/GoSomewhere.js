import React, { Component, PropTypes } from 'react'
import { easeOutCubic } from 'easing-js'

let iteration = 0
const requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.msRequestAnimationFrame

export default (BaseComponent) => {
  class GoSomewhere extends Component {
    constructor() {
      super()

      this.state = {
        ScrollPosition: 0,
        startLoop: false,
        targetOffsetTop: 0
      }

      this.isMount = false

      this.setUp = this.setUp.bind(this)
      this.animateToTarget = this.animateToTarget.bind(this)
      this.getScrollPosition = this.getScrollPosition.bind(this)
      this.animationLoop = this.animationLoop.bind(this)
      this.stopEverything = this.stopEverything.bind(this)
      this.checkIsBottom = this.checkIsBottom.bind(this)
    }

    componentDidMount() {
      this.setUp()
      this.isMount = true
    }

    shouldComponentUpdate(nextProps, nextState) {
      return nextState.ScrollPosition !== this.state.ScrollPosition ||
             nextState.startLoop !== this.state.startLoop ||
             nextState.targetOffsetTop !== this.state.targetOffsetTop ||
             nextProps.targetId !== this.props.targetId ||
             nextProps.verticalDisplacement !== this.verticalDisplacement
    }

    componentWillUnmount() {
      this.isMount = false
    }

    getScrollPosition() {
      if (document.documentElement.scrollTop === 0) {
        return document.body.scrollTop
      }

      return document.documentElement.scrollTop
    }

    setUp() {
      // deal with the mouse wheel - 動畫播放時，滑鼠滾動即停止
      const bodyElement = document.querySelector('body')
      bodyElement.addEventListener('mousewheel', this.stopEverything)
      bodyElement.addEventListener('DOMMouseScroll', this.stopEverything)

      this.animationLoop()
    }

    getCurrentValue() {
      // easeOutCubic(currentIteration, startValue, changeInValue, totalIterations){}
      // https://www.kirupa.com/js/easing.js

      const { ScrollPosition, targetOffsetTop } = this.state

      const changeInValue = (targetOffsetTop - ScrollPosition > 0)
      ? targetOffsetTop - ScrollPosition
      : -ScrollPosition

      return easeOutCubic(iteration, ScrollPosition, changeInValue, 120)
    }

    animateToTarget() {
      if (this.isMount) {
        // do something when the up arrow is clicked
        const { targetId, verticalDisplacement } = this.props
        const obj = document.getElementById(targetId)

        this.setState({
          ScrollPosition: this.getScrollPosition(),
          startLoop: true,
          targetOffsetTop: obj.offsetTop - verticalDisplacement
        })

        iteration = 0
      }
    }

    stopEverything() {
      if (this.isMount) {
        this.setState({ startLoop: false })
      }
    }

    checkIsBottom() {
      const atTheBottomOfThePage = (window.innerHeight + window.scrollY) >= document.body.offsetHeight

      if (atTheBottomOfThePage) { return true }
      return false
    }

    animationLoop() {
      const { startLoop, targetOffsetTop, ScrollPosition } = this.state

      // startLoop is true when you click on the "go to" button
      if (startLoop) {
        window.scrollTo(0, this.getCurrentValue())

        iteration++

        // once you reach the target of the document, or reach the bottom , stop the scrolling
        const isTopToBottom = targetOffsetTop - ScrollPosition > 0
        const condition = isTopToBottom
        ? this.getScrollPosition() >= targetOffsetTop || this.checkIsBottom()
        : this.getScrollPosition() <= targetOffsetTop

        if (condition) { this.stopEverything() }
      }

      requestAnimationFrame(this.animationLoop)
    }

    render() {
      return <BaseComponent {...this.props} handleAnimate={this.animateToTarget} />
    }
  }

  GoSomewhere.propTypes = {
    targetId: PropTypes.string.isRequired,
    verticalDisplacement: PropTypes.number
  }

  GoSomewhere.defaultProps = {
    verticalDisplacement: 0
  }

  return GoSomewhere
}
