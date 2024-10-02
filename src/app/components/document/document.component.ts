import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, effect } from '@angular/core';
import { VeltService } from '../../services/velt.service';
import { AuthService } from '../../services/auth.service';


import { AgCartesianSeriesTooltipRendererParams } from 'ag-charts-community';

// Angular Chart Component
import { AgCharts } from 'ag-charts-angular';
// Chart Options Type Interface
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';


var myTheme: AgChartTheme = {
	baseTheme: 'ag-polychroma-dark',
	palette: {
		fills: ["#0DCF82", "#0076C5", "#21B372", "#FDDE02", "#F76700", "#D30018"],
		strokes: ["black"],
	},
	overrides: {
		common: {
			background: {
				fill: 'black',
			},
			title: {
				fontSize: 16,
			},
			axes: {
				category: {
					line: {
						width: 0
					},
					label: {
						color: '#808080'  // Set y-axis label color to gray
					},
				},

				number: {
					label: {
						color: '#808080'  // Set y-axis label color to gray
					},
					gridLine: {
						style: [{
							stroke: 'rgba(255, 255, 255, 0.16)',
						}],
					},
				},
			}
		},
		line: {
			series: {
				interpolation: {
					type: 'smooth'
				},
				marker: {
					fill: '#0DCF82',
					size: 12,
					strokeWidth: 4,
					shape: 'circle',
				},
				label: {
					enabled: false,
				},
			},
		}
	},
};


@Component({
	selector: 'app-document',
	standalone: true,
	imports: [AgCharts],
	templateUrl: './document.component.html',
	styleUrl: './document.component.scss',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})


export class DocumentComponent {
	/** Context for comment configuration */
	context = { canvasCommentConfig: { data: { seriesId: '', xValue: '', yValue: '', chartId: '' }, position: { x: 0, y: 0 } } }

	/** Velt client signal */
	client = this.veltService.clientSignal();
	@ViewChild('veltCommentsRef', { static: true }) veltCommentsRef!: ElementRef<HTMLDivElement>;

	// Chart Options
	public chartOptions: AgChartOptions;

	private lastMouseX: number = 0;
	private lastMouseY: number = 0;



	constructor(private authService: AuthService,
		private veltService: VeltService) {

		// Set up Velt client and document when initialized
		effect(() => {
			this.client = this.veltService.clientSignal();
			if (this.client) {
				// Contain your comments in a document by setting a Document ID & Name
				this.client.setDocument('charts_ag_charts', { documentName: 'charts_ag_charts' });

				// Set Dark Mode
				this.client.setDarkMode(true)

				const commentElement = this.client?.getCommentElement()
				commentElement?.getAllCommentAnnotations().subscribe((commentAnnotations: any) => {
					this.renderCommentAnnotations(commentAnnotations)
				});

				commentElement?.disableCommentPinHighlighter();
			}
		});

		this.chartOptions = {
			// Data: Data to be displayed in the chart
			data: [
				{ month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
				{ month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
				{ month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
				{ month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
				{ month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
				{ month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
			],
			// Series: Defines which chart type and data to use
			series: [
				{
					type: 'line', xKey: 'month', yKey: 'iceCreamSales',
					tooltip: {
						renderer: (params: AgCartesianSeriesTooltipRendererParams) => {
							const tooltipContent = document.querySelector('.ag-chart-tooltip') as HTMLElement;
							const canvas = document.querySelector('#ag-chart') as HTMLElement;
							if (tooltipContent) {
								const rect = tooltipContent.getBoundingClientRect();
								let canvasRect = canvas.getBoundingClientRect()
								// console.log('Tooltip position:', rect);
								this.lastMouseY = rect.top + (rect.height / 2) + 32;
								this.lastMouseX = rect.left + rect.width / 2

								this.lastMouseY = rect.top - (canvasRect.height);
								this.lastMouseX = rect.left - (rect.width * 2)

							}

							return `<div class="ag-chart-tooltip-title" style="background-color: #212121">  ${params.datum[params.xKey]}  -  ${params.datum[params.yKey]} </div>`;
						},

					},
					marker: {
						fill: '#0DCF82',
						size: 10,
						strokeWidth: 4,
						shape: 'circle',
					},
					nodeClickRange: "nearest",
				},
			], listeners: {
				seriesNodeClick: (event: any) => {
					console.log('Clicked data point:', event);
					console.log(this.chartOptions.series)

				},
			},

			theme: myTheme
		};
	}

	async ngOnInit(): Promise<void> {
		await this.veltService.setDocument('charts-ag', { documentName: 'charts-ag' });
		this.veltService.setDarkMode(true);

		const commentElement = this.client?.getCommentElement()

		commentElement?.getAllCommentAnnotations().subscribe((commentAnnotations: any) => {
			console.log("helo");

			this.renderCommentAnnotations(commentAnnotations)
		});

		commentElement?.disableCommentPinHighlighter();


		this.veltCommentsRef.nativeElement?.addEventListener('onCommentAdd', (event: any) => {
			console.log('*** onCommentAdd ***');

			console.log(this.lastMouseX, this.lastMouseY);


			event.detail?.addContext({ canvasCommentConfig: { id: 'sample-ag-charts-comment', position: { x: this.lastMouseX, y: this.lastMouseY } }, commentType: 'manual' });
		});


	}

	renderCommentAnnotations(commentAnnotations: any) {
		console.log("helo");

		try {
			const commentsContainer = document.querySelector('.html-canvas');
			console.log(commentsContainer);

			if (commentAnnotations) {
				commentAnnotations.forEach((commentAnnotation: any) => {
					if (!document.getElementById(`comment-pin-container-${commentAnnotation.annotationId}`) && commentAnnotation.context) {
						// Add Comment Pin if it doesn't exist
						const { x, y } = commentAnnotation.context.canvasCommentConfig.position;
						console.log({ x, y });

						var commentPinContainer = document.createElement('div');
						commentPinContainer.className = 'comment-pin-container';
						commentPinContainer.id = `comment-pin-container-${commentAnnotation.annotationId}`;
						commentPinContainer.style.left = x + 'px';
						commentPinContainer.style.top = y + 'px';
						commentPinContainer.innerHTML = `<velt-comment-pin annotation-id="${commentAnnotation?.annotationId}"></velt-comment-pin>`;
						commentsContainer?.appendChild(commentPinContainer);
					}
				});
			}
		} catch (error) {
			console.error('97', error);
		}

	}

	updateMarker(event: any) {
		try {
			if (this.chartOptions && this.chartOptions.series) {
				const clickedNode = event.datum;
				const series = this.chartOptions.series[0] as any;

				series.marker.formatter = (params: any) => {

					if (params.datum === clickedNode) {
						// Custom SVG for clicked node
						return {
							shape: 'custom',
							size: 20,
							fill: '#0DCF82',
							strokeWidth: 2,
							stroke: 'white',
							path: 'M-6,-6 L6,-6 L0,6 Z', // Triangle pointing down
						};
					}
					// Default circle for other nodes
					return {
						shape: 'circle',
						size: 12,
						fill: '#0DCF82',
						strokeWidth: 4,
						stroke: 'white',
					};
				};

				// Trigger chart update
				this.chartOptions = { ...this.chartOptions };
			}
		} catch (error) {
			console.error('Error updating marker:', error);
		}
	}

}
